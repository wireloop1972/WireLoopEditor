import { EventEmitter } from 'events';
import {
  FunctionRegistration,
  FunctionMetrics,
  ExecutionContext,
  ExecutionResult,
  FunctionError,
  FunctionErrorType,
  FunctionRegistryEvent,
  RateLimit,
  Quota,
} from '@/types/functions';

interface RateLimitInfo {
  windowStart: number;
  requestCount: number;
}

interface QuotaInfo {
  daily: {
    date: string;
    count: number;
  };
  monthly: {
    month: string;
    count: number;
  };
}

export class FunctionRegistry extends EventEmitter {
  private functions: Map<string, FunctionRegistration>;
  private metrics: Map<string, FunctionMetrics>;
  private rateLimits: Map<string, Map<string, RateLimitInfo>>;
  private quotas: Map<string, Map<string, QuotaInfo>>;

  constructor() {
    super();
    this.functions = new Map();
    this.metrics = new Map();
    this.rateLimits = new Map();
    this.quotas = new Map();
  }

  /**
   * Register a new function
   */
  public register(registration: FunctionRegistration): void {
    if (this.functions.has(registration.name)) {
      throw new FunctionError(
        FunctionErrorType.VALIDATION_ERROR,
        `Function ${registration.name} already registered`
      );
    }

    this.functions.set(registration.name, registration);
    this.metrics.set(registration.name, {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      averageDuration: 0,
      errorRate: 0,
      quotaUsage: {},
    });

    this.emit(FunctionRegistryEvent.FUNCTION_REGISTERED, registration);
  }

  /**
   * Update an existing function
   */
  public update(registration: FunctionRegistration): void {
    if (!this.functions.has(registration.name)) {
      throw new FunctionError(
        FunctionErrorType.VALIDATION_ERROR,
        `Function ${registration.name} not found`
      );
    }

    this.functions.set(registration.name, registration);
    this.emit(FunctionRegistryEvent.FUNCTION_UPDATED, registration);
  }

  /**
   * Remove a function
   */
  public remove(functionName: string): void {
    if (!this.functions.has(functionName)) {
      throw new FunctionError(
        FunctionErrorType.VALIDATION_ERROR,
        `Function ${functionName} not found`
      );
    }

    this.functions.delete(functionName);
    this.metrics.delete(functionName);
    this.rateLimits.delete(functionName);
    this.quotas.delete(functionName);

    this.emit(FunctionRegistryEvent.FUNCTION_REMOVED, functionName);
  }

  /**
   * Execute a function
   */
  public async execute(
    functionName: string,
    params: Record<string, any>,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    const func = this.functions.get(functionName);
    if (!func) {
      throw new FunctionError(
        FunctionErrorType.VALIDATION_ERROR,
        `Function ${functionName} not found`
      );
    }

    if (!func.enabled) {
      throw new FunctionError(
        FunctionErrorType.DISABLED_ERROR,
        `Function ${functionName} is disabled`
      );
    }

    // Check rate limits
    this.checkRateLimit(functionName, context.agentId, func.rateLimit);

    // Check quotas
    this.checkQuota(functionName, context.agentId, func.quota);

    const startTime = Date.now();
    let result: any;
    let error: Error | undefined;
    let retries = 0;
    const logs: string[] = [];

    try {
      this.emit(FunctionRegistryEvent.EXECUTION_STARTED, {
        functionName,
        context,
      });

      // Execute with retries
      while (retries < context.maxRetries) {
        try {
          result = await Promise.race([
            func.implementation(params, context),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error('Function execution timed out')),
                func.timeout
              )
            ),
          ]);
          break;
        } catch (e) {
          error = e as Error;
          retries++;
          if (retries === context.maxRetries) {
            throw error;
          }
          logs.push(`Retry ${retries}/${context.maxRetries}: ${error.message}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }

      const duration = Date.now() - startTime;
      this.updateMetrics(functionName, true, duration);

      const executionResult: ExecutionResult = {
        success: true,
        result,
        duration,
        retries,
        logs,
      };

      this.emit(FunctionRegistryEvent.EXECUTION_COMPLETED, {
        functionName,
        result: executionResult,
        context,
      });

      return executionResult;
    } catch (e) {
      const duration = Date.now() - startTime;
      this.updateMetrics(functionName, false, duration);

      const executionError = new FunctionError(
        FunctionErrorType.EXECUTION_ERROR,
        e instanceof Error ? e.message : 'Unknown error',
        e
      );

      this.emit(FunctionRegistryEvent.EXECUTION_FAILED, {
        functionName,
        error: executionError,
        context,
      });

      throw executionError;
    }
  }

  /**
   * Get function metrics
   */
  public getMetrics(functionName: string): FunctionMetrics | undefined {
    return this.metrics.get(functionName);
  }

  /**
   * Check rate limits
   */
  private checkRateLimit(
    functionName: string,
    agentId: string,
    rateLimit?: RateLimit
  ): void {
    if (!rateLimit) return;

    const key = rateLimit.perAgent ? `${functionName}:${agentId}` : functionName;
    let functionLimits = this.rateLimits.get(functionName);
    
    if (!functionLimits) {
      functionLimits = new Map();
      this.rateLimits.set(functionName, functionLimits);
    }

    const now = Date.now();
    let limitInfo = functionLimits.get(key);

    if (!limitInfo || now - limitInfo.windowStart > rateLimit.windowMs) {
      limitInfo = { windowStart: now, requestCount: 0 };
    }

    if (limitInfo.requestCount >= rateLimit.maxRequests) {
      this.emit(FunctionRegistryEvent.RATE_LIMIT_EXCEEDED, {
        functionName,
        agentId,
        rateLimit,
      });

      throw new FunctionError(
        FunctionErrorType.RATE_LIMIT_ERROR,
        `Rate limit exceeded for function ${functionName}`
      );
    }

    limitInfo.requestCount++;
    functionLimits.set(key, limitInfo);
  }

  /**
   * Check quotas
   */
  private checkQuota(
    functionName: string,
    agentId: string,
    quota?: Quota
  ): void {
    if (!quota) return;

    const key = quota.perAgent ? `${functionName}:${agentId}` : functionName;
    let functionQuotas = this.quotas.get(functionName);
    
    if (!functionQuotas) {
      functionQuotas = new Map();
      this.quotas.set(functionName, functionQuotas);
    }

    let quotaInfo = functionQuotas.get(key);
    const today = new Date().toISOString().split('T')[0];
    const month = today.substring(0, 7);

    if (!quotaInfo) {
      quotaInfo = {
        daily: { date: today, count: 0 },
        monthly: { month, count: 0 },
      };
    }

    // Reset daily quota if date changed
    if (quotaInfo.daily.date !== today) {
      quotaInfo.daily = { date: today, count: 0 };
    }

    // Reset monthly quota if month changed
    if (quotaInfo.monthly.month !== month) {
      quotaInfo.monthly = { month, count: 0 };
    }

    // Check daily quota
    if (quota.daily && quotaInfo.daily.count >= quota.daily) {
      this.emit(FunctionRegistryEvent.QUOTA_EXCEEDED, {
        functionName,
        agentId,
        quota: 'daily',
      });

      throw new FunctionError(
        FunctionErrorType.QUOTA_ERROR,
        `Daily quota exceeded for function ${functionName}`
      );
    }

    // Check monthly quota
    if (quota.monthly && quotaInfo.monthly.count >= quota.monthly) {
      this.emit(FunctionRegistryEvent.QUOTA_EXCEEDED, {
        functionName,
        agentId,
        quota: 'monthly',
      });

      throw new FunctionError(
        FunctionErrorType.QUOTA_ERROR,
        `Monthly quota exceeded for function ${functionName}`
      );
    }

    quotaInfo.daily.count++;
    quotaInfo.monthly.count++;
    functionQuotas.set(key, quotaInfo);
  }

  /**
   * Update function metrics
   */
  private updateMetrics(
    functionName: string,
    success: boolean,
    duration: number
  ): void {
    const metrics = this.metrics.get(functionName);
    if (!metrics) return;

    metrics.totalCalls++;
    if (success) {
      metrics.successfulCalls++;
    } else {
      metrics.failedCalls++;
    }

    metrics.averageDuration =
      (metrics.averageDuration * (metrics.totalCalls - 1) + duration) /
      metrics.totalCalls;
    metrics.lastExecuted = new Date();
    metrics.errorRate = metrics.failedCalls / metrics.totalCalls;

    this.metrics.set(functionName, metrics);
  }
} 