import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../../logger/logger.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggerService: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, details } = this.getErrorDetails(exception);

    // Only log internal server errors
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.loggerService.error(
        'GlobalExceptionFilter',
        `${request.method} ${request.url} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
        {
          userId: (request as any).user?.id || 'anonymous',
          method: request.method,
          url: request.url,
          userAgent: request.get('User-Agent'),
          ip: request.ip,
          body: request.body,
          query: request.query,
          params: request.params,
          statusCode: status,
          details,
        },
      );
    }

    // Send error response
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
      ...(process.env.NODE_ENV === 'development' && details && { details }),
    };

    response.status(status).json(errorResponse);
  }

  private getErrorDetails(exception: unknown): {
    status: number;
    message: string;
    details?: any;
  } {
    // Handle NestJS HttpExceptions
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      return {
        status: exception.getStatus(),
        message: typeof response === 'string' ? response : (response as any).message || 'An error occurred',
        details: typeof response === 'object' ? response : undefined,
      };
    }

    // Handle Prisma errors
    if (exception instanceof PrismaClientKnownRequestError) {
      return this.handlePrismaError(exception);
    }

    // Handle validation errors
    if (exception instanceof Error && exception.name === 'ValidationError') {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        details: exception.message,
      };
    }

    // Handle JWT errors
    if (exception instanceof Error && exception.name === 'JsonWebTokenError') {
      return {
        status: HttpStatus.UNAUTHORIZED,
        message: 'Invalid token',
        details: exception.message,
      };
    }

    if (exception instanceof Error && exception.name === 'TokenExpiredError') {
      return {
        status: HttpStatus.UNAUTHORIZED,
        message: 'Token expired',
        details: exception.message,
      };
    }

    // Handle unknown errors
    if (exception instanceof Error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : exception.message,
        details: process.env.NODE_ENV === 'development' ? exception.stack : undefined,
      };
    }

    // Handle non-Error exceptions
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? String(exception) : undefined,
    };
  }

  private handlePrismaError(error: PrismaClientKnownRequestError): {
    status: number;
    message: string;
    details?: any;
  } {
    switch (error.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          message: 'A record with this data already exists',
          details: `Unique constraint failed on: ${error.meta?.target}`,
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Record not found',
          details: 'The requested record does not exist',
        };
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Foreign key constraint failed',
          details: 'The operation failed due to a foreign key constraint',
        };
      case 'P2021':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Table does not exist',
          details: error.message,
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database error occurred',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        };
    }
  }
}