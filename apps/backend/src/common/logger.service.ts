import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class CustomLogger implements LoggerService {
  log(message: any, context?: string) {
    console.log(
      `[LOG] ${this.getTimestamp()} ${context ? `[${context}] ` : ''}${message}`,
    );
  }

  error(message: any, trace?: string, context?: string) {
    console.error(
      `[ERROR] ${this.getTimestamp()} ${context ? `[${context}] ` : ''}${message}`,
    );
    if (trace) {
      console.error(`Trace: ${trace}`);
    }
  }

  warn(message: any, context?: string) {
    console.warn(
      `[WARN] ${this.getTimestamp()} ${context ? `[${context}] ` : ''}${message}`,
    );
  }

  debug(message: any, context?: string) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(
        `[DEBUG] ${this.getTimestamp()} ${context ? `[${context}] ` : ''}${message}`,
      );
    }
  }

  verbose(message: any, context?: string) {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[VERBOSE] ${this.getTimestamp()} ${context ? `[${context}] ` : ''}${message}`,
      );
    }
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }
}
