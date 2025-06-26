import { BadRequestException, Body, Controller, HttpCode, HttpStatus, InternalServerErrorException, Post } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { RegisterUserDto } from "../dto/register-user.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserTransformer } from "../transformers/user.transformer";
import { plainToInstance } from "class-transformer";
import { LoggerService } from "../../logger/logger.service";
import { User } from "@prisma/client";
import { LoginDto } from "../dto/login.dto";

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account with the provided credentials'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
    type: UserTransformer,
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'User registered successfully'
        },
        user: {
          $ref: '#/components/schemas/UserTransformer'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or user already exists',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'User already exists'
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
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Server error occurred during registration',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'Failed to register user'
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
  async register(
    @Body() registerUserDto: RegisterUserDto
  ): Promise<{
    message: string;
    user: UserTransformer;
  }> {
    const userExists = await this.authService.checkIfUserExists(registerUserDto.email);

    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    let user: User;

    try {
      user = await this.authService.register(registerUserDto);
    } catch (error) {
      this.logger.error('AuthController', 'Error registering user', error);
      throw new InternalServerErrorException('Failed to register user');
    }
    
    return {
      message: 'User registered successfully',
      user: plainToInstance(UserTransformer, user),
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticates user credentials and returns access token'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged in successfully',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'User logged in successfully'
        },
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        },
        user: {
          $ref: '#/components/schemas/UserTransformer'
        }
      }
    }
  })
  @ApiResponse({
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
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Server error occurred during login',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'Failed to login user'
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
  async login(@Body() loginUserDto: LoginDto): Promise<{
    message: string;
    access_token: string;
    user: UserTransformer;
  }> {
    try {
      this.logger.log('AuthController', 'Logging in user', loginUserDto);
      const { access_token, user } = await this.authService.login(loginUserDto);
      return {
        message: 'User logged in successfully',
        access_token,
        user: plainToInstance(UserTransformer, user),
      };
    } catch (error) {
      this.logger.error('AuthController', 'Error logging in user', error);
      throw new InternalServerErrorException('Failed to login user');
    }
  }
}