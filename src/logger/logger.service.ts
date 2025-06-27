import { Injectable, Scope } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  log(context: string, message: string, ...meta: any[]) {
    this.logger.info(message, { context, ...meta });
  }

  error(context: string, message: string, trace?: string, ...meta: any[]) {
    this.logger.error(message, { context, trace, ...meta });
  }

  warn(context: string, message: string, ...meta: any[]) {
    this.logger.warn(message, { context, ...meta });
  }

  debug(context: string, message: string, ...meta: any[]) {
    this.logger.debug(message, { context, ...meta });
  }

  verbose(context: string, message: string, ...meta: any[]) {
    this.logger.verbose(message, { context, ...meta });
  }

  // Method to log HTTP requests
  logHttpRequest(req: any, context = 'HTTP') {
    this.logger.info('Incoming Request', {
      context,
      method: req.method,
      url: req.url,
      headers: req.headers,
      query: req.query,
      body: req.body,
    });
  }

  // Method to log HTTP responses
  logHttpResponse(res: any, context = 'HTTP') {
    this.logger.info('Outgoing Response', {
      context,
      statusCode: res.statusCode,
      body: res.body,
    });
  }

  // Method to log errors with stack traces
  logError(error: Error, context = 'Application') {
    this.logger.error('Error occurred', {
      context,
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack,
      },
    });
  }

  // Method to log performance metrics
  logPerformance(operation: string, timeInMs: number, context = 'Performance') {
    this.logger.info('Performance metric', {
      context,
      operation,
      timeInMs,
      timestamp: new Date().toISOString(),
    });
  }
}
