import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReadingIntervalResponseDto, ReadingIntervalErrorResponseDto } from '../../dto/responses/reading-interval-response.dto';

export const CreateReadingIntervalsSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Create reading intervals',
      description: 'Create multiple reading intervals for books. This will track user\'s reading progress.'
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Reading intervals created successfully',
      type: ReadingIntervalResponseDto
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid input data or validation error',
      type: ReadingIntervalErrorResponseDto
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'User not authenticated or invalid token',
      type: ReadingIntervalErrorResponseDto
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'User does not have required permissions',
      type: ReadingIntervalErrorResponseDto
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Book not found',
      type: ReadingIntervalErrorResponseDto
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal server error occurred',
      type: ReadingIntervalErrorResponseDto
    })
  );
}; 