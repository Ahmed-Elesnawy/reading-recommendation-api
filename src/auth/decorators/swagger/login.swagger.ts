import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginResponseDto } from '../../dto/auth-response.dto';

export const LoginSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Login user',
      description: 'Authenticates user credentials and returns access token'
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User logged in successfully',
      type: LoginResponseDto
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Invalid credentials',
      schema: {
        properties: {
          message: {
            type: 'string',
            example: 'Invalid credentials'
          },
          error: {
            type: 'string',
            example: 'Unauthorized'
          },
          statusCode: {
            type: 'number',
            example: 401
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
      description: 'Server error occurred during login',
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