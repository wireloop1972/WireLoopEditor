export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
}

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export class CircuitBreakerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime?: number;
  private readonly config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

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

  public canExecute(): boolean {
    if (this.state === CircuitState.CLOSED) return true;
    
    if (this.state === CircuitState.OPEN && 
        this.lastFailureTime && 
        Date.now() - this.lastFailureTime > this.config.resetTimeout) {
      this.state = CircuitState.HALF_OPEN;
      return true;
    }
    
    return this.state === CircuitState.HALF_OPEN;
  }

  public recordSuccess(): void {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  public recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  public getState(): CircuitState {
    return this.state;
  }

  public reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = undefined;
  }
} 