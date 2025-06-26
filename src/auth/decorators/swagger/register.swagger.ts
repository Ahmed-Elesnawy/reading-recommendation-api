import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterResponseDto } from '../../dto/auth-response.dto';

export const RegisterSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Register a new user',
      description: 'Creates a new user account with the provided credentials'
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'User registered successfully',
      type: RegisterResponseDto
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'User already exists',
      schema: {
        properties: {
          message: {
            type: 'string',
            example: 'User already exists'
          },
          error: {
            type: 'string',
            example: 'Conflict'
          },
          statusCode: {
            type: 'number',
            example: 409
          }
        }
      }
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid input data',
      schema: {
        properties: {
          message: {
            type: 'string',
            example: 'Invalid input data'
          },
          error: {
            type: 'string',
            example: 'Bad Request'
          },
          statusCode: {
            type: 'number',
            example: 400
          }
        }
      }
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Server error occurred during registration',
      schema: {
        properties: {
          message: {
            type: 'string',
            example: 'Internal server error occurred'
          },
          error: {
            type: 'string',
            example: 'Internal Server Error'
          },
          statusCode: {
            type: 'number',
            example: 500
          }
        }
      }
    })
  );
}; 