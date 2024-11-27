export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
}

export type CircuitBreakerStatus = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreakerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

export class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private status: CircuitBreakerStatus = 'CLOSED';

  constructor(private config: CircuitBreakerConfig) {}

  public async execute<T>(action: () => Promise<T>): Promise<T> {
    if (!this.canExecute()) {
      throw new CircuitBreakerError('Circuit breaker is OPEN');
    }

    try {
      const result = await action();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  public recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.config.failureThreshold) {
      this.status = 'OPEN';
    }
  }

  public recordSuccess(): void {
    this.failures = 0;
    this.status = 'CLOSED';
  }

  public canExecute(): boolean {
    if (this.status === 'CLOSED') return true;
    
    if (this.status === 'OPEN' && 
        Date.now() - this.lastFailureTime > this.config.resetTimeout) {
      this.status = 'HALF_OPEN';
      return true;
    }
    
    return this.status === 'HALF_OPEN';
  }

  public getStatus(): CircuitBreakerStatus {
    return this.status;
  }

  public reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.status = 'CLOSED';
  }
} 