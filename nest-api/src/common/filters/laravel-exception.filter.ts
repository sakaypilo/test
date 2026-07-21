import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';
import { Response } from 'express';

@Catch()
export class LaravelExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(LaravelExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    // Handle validation errors first (format: success: false, message, errors)
    if (exception instanceof UnprocessableEntityException) {
      const response = exception.getResponse() as any;
      return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        success: false,
        message: response.message || 'The given data was invalid.',
        errors: response.errors || {},
      });
    }

    // Handle HTTP exceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse() as any;

      if (typeof response === 'string') {
        return res.status(status).json({
          success: false,
          message: response,
        });
      }

      // If it's already a Laravel-like error object
      if (response.success !== undefined) {
        return res.status(status).json(response);
      }

      return res.status(status).json({
        success: false,
        message: response?.message || 'An error occurred',
        ...(response.errors && { errors: response.errors }),
      });
    }

    // Handle Prisma errors
    if (exception instanceof PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        const target = (exception.meta as any)?.target as string[] | undefined;
        const field = target?.[0] || '_';

        return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
          success: false,
          message: 'The given data was invalid.',
          errors: { [field]: ['The value has already been taken.'] },
        });
      }

      if (exception.code === 'P2025') {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Resource not found',
        });
      }

      this.logger.error('Prisma Error', exception.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Database error',
      });
    }

    if (exception instanceof PrismaClientValidationError) {
      this.logger.error('Prisma Validation Error', exception.stack);
      return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        success: false,
        message: (exception as Error).message,
      });
    }

    // Handle other errors
    this.logger.error('Internal server error', (exception as Error).stack);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
