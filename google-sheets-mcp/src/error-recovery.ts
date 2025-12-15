/**
 * Smart error recovery and resilience system
 */

export interface RecoveryStrategy {
  name: string;
  canRecover(error: any): boolean;
  recover(error: any, context: any): Promise<any>;
}

export interface ErrorContext {
  operation: string;
  spreadsheetId?: string;
  range?: string;
  formula?: string;
  attempt: number;
  maxRetries: number;
}

export class ErrorRecoverySystem {
  private strategies: RecoveryStrategy[] = [];
  private maxRetries = 3;
  private retryDelays = [1000, 2000, 4000]; // Exponential backoff

  constructor() {
    this.initializeStrategies();
  }

  /**
   * Execute operation with smart error recovery
   */
  async executeWithRecovery<T>(
    operation: () => Promise<T>,
    context: ErrorContext
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        context.attempt = attempt;
        return await operation();
      } catch (error) {
        lastError = error;

        // Try recovery strategies
        const recoveryResult = await this.attemptRecovery(error, context);
        if (recoveryResult.recovered) {
          // Retry with recovered context
          context = { ...context, ...recoveryResult.newContext };
          continue;
        }

        // If not the last attempt, wait before retry
        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelays[attempt - 1]);
        }
      }
    }

    // All recovery attempts failed
    throw this.enrichError(lastError, context);
  }

  /**
   * Attempt recovery using available strategies
   */
  private async attemptRecovery(error: any, context: ErrorContext): Promise<{
    recovered: boolean;
    newContext?: Partial<ErrorContext>;
  }> {
    for (const strategy of this.strategies) {
      if (strategy.canRecover(error)) {
        try {
          const result = await strategy.recover(error, context);
          return { recovered: true, newContext: result };
        } catch (recoveryError) {
          // Recovery failed, try next strategy
          continue;
        }
      }
    }

    return { recovered: false };
  }

  /**
   * Enrich error with context and suggestions
   */
  private enrichError(error: any, context: ErrorContext): Error {
    const enrichedError = new Error(
      `Operation '${context.operation}' failed after ${context.attempt} attempts. ${error.message}`
    );

    // Add suggestions based on error type
    const suggestions = this.getSuggestions(error, context);
    if (suggestions.length > 0) {
      (enrichedError as any).suggestions = suggestions;
    }

    (enrichedError as any).originalError = error;
    (enrichedError as any).context = context;

    return enrichedError;
  }

  /**
   * Get helpful suggestions based on error
   */
  private getSuggestions(error: any, context: ErrorContext): string[] {
    const suggestions: string[] = [];

    if (error.message?.includes('permission')) {
      suggestions.push('Check if the spreadsheet is shared with your service account');
      suggestions.push('Verify the service account has edit permissions');
    }

    if (error.message?.includes('range')) {
      suggestions.push('Verify the range notation is correct (e.g., "Sheet1!A1:B10")');
      suggestions.push('Check if the sheet name exists in the spreadsheet');
    }

    if (error.message?.includes('quota')) {
      suggestions.push('You may have exceeded API quota limits');
      suggestions.push('Consider reducing the frequency of requests');
    }

    if (error.message?.includes('formula')) {
      suggestions.push('Check formula syntax for errors');
      suggestions.push('Verify all referenced cells and ranges exist');
    }

    return suggestions;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private initializeStrategies(): void {
    // Range correction strategy
    this.strategies.push({
      name: 'RangeCorrection',
      canRecover: (error) => error.message?.includes('range') || error.message?.includes('Invalid range'),
      recover: async (error, context) => {
        // Try to fix common range issues
        if (context.range) {
          // Remove extra spaces
          let fixedRange = context.range.trim();

          // Fix common notation issues
          fixedRange = fixedRange.replace(/'/g, "'"); // Fix quotes
          fixedRange = fixedRange.replace(/['']/g, "'"); // Normalize quotes

          // Ensure proper sheet reference
          if (!fixedRange.includes('!') && !fixedRange.match(/^[A-Z]+\d+/)) {
            fixedRange = `Sheet1!${fixedRange}`;
          }

          return { range: fixedRange };
        }
        throw new Error('Cannot recover range');
      }
    });

    // Formula validation strategy
    this.strategies.push({
      name: 'FormulaValidation',
      canRecover: (error) => error.message?.includes('formula') || error.message?.includes('FORMULA'),
      recover: async (error, context) => {
        if (context.formula) {
          let fixedFormula = context.formula;

          // Ensure formula starts with =
          if (!fixedFormula.startsWith('=')) {
            fixedFormula = '=' + fixedFormula;
          }

          // Fix common syntax issues
          fixedFormula = fixedFormula.replace(/'/g, '"'); // Replace single quotes with double quotes in strings

          return { formula: fixedFormula };
        }
        throw new Error('Cannot recover formula');
      }
    });

    // Permission retry strategy
    this.strategies.push({
      name: 'PermissionRetry',
      canRecover: (error) => error.status === 403 || error.message?.includes('permission'),
      recover: async (error, context) => {
        // Wait longer for permission issues (might be temporary)
        await this.delay(5000);
        return {}; // Just retry
      }
    });

    // Rate limit strategy
    this.strategies.push({
      name: 'RateLimit',
      canRecover: (error) => error.status === 429 || error.message?.includes('quota'),
      recover: async (error, context) => {
        // Wait longer for rate limiting
        const waitTime = Math.min(30000, 1000 * Math.pow(2, context.attempt));
        await this.delay(waitTime);
        return {};
      }
    });

    // Network retry strategy
    this.strategies.push({
      name: 'NetworkRetry',
      canRecover: (error) => error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.status >= 500,
      recover: async (error, context) => {
        // Network issues - just retry with delay
        return {};
      }
    });
  }

  /**
   * Add custom recovery strategy
   */
  addStrategy(strategy: RecoveryStrategy): void {
    this.strategies.push(strategy);
  }

  /**
   * Set retry configuration
   */
  setRetryConfig(maxRetries: number, delays: number[]): void {
    this.maxRetries = maxRetries;
    this.retryDelays = delays;
  }
}

/**
 * Decorator for automatic error recovery
 */
export function withErrorRecovery(errorRecovery: ErrorRecoverySystem) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const context: ErrorContext = {
        operation: propertyName,
        attempt: 1,
        maxRetries: 3
      };

      // Extract context from arguments if available
      if (args.length > 0 && typeof args[0] === 'object') {
        context.spreadsheetId = args[0].spreadsheetId;
        context.range = args[0].range;
        context.formula = args[0].formula;
      }

      return errorRecovery.executeWithRecovery(
        () => method.apply(this, args),
        context
      );
    };

    return descriptor;
  };
}