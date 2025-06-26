import { BadRequestException, Body, ConflictException, Controller, HttpCode, HttpStatus, InternalServerErrorException, Post, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { RegisterUserDto } from "../dto/register-user.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserTransformer } from "../transformers/user.transformer";
import { plainToInstance } from "class-transformer";
import { LoggerService } from "../../logger/logger.service";
import { LoginDto } from "../dto/login.dto";
import { LoginResponseDto, RegisterResponseDto } from "../dto/auth-response.dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

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
    type: RegisterResponseDto
  })
  @ApiResponse({
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
  })
  @ApiResponse({
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
  })
  @ApiResponse({
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
  async register(
    @Body() registerUserDto: RegisterUserDto
  ): Promise<RegisterResponseDto> {
    try {      
      const userExists = await this.authService.checkIfUserExists(registerUserDto.email);

      if (userExists) {
        throw new ConflictException('User already exists');
      }

      const user = await this.authService.register(registerUserDto);
            
      return {
        message: 'User registered successfully',
        user: plainToInstance(UserTransformer, user),
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      
      if (error instanceof PrismaClientKnownRequestError) {
        this.logger.error('AuthController', `Database error during registration: ${error.code}`, error.message);
        throw new BadRequestException('Invalid input data');
      }

      this.logger.error('AuthController', 'Error registering user', error instanceof Error ? error.message : 'Unknown error');
      throw new InternalServerErrorException('Internal server error occurred');
    }
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
    type: LoginResponseDto
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
  })
  @ApiResponse({
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
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    try {
      this.logger.log('AuthController', `Login attempt for email: ${loginDto.email}`);
      
      const { access_token, user } = await this.authService.login(loginDto);
      
      this.logger.log('AuthController', `User logged in successfully: ${user.email}`);
      
      return {
        message: 'User logged in successfully',
        access_token,
        user: plainToInstance(UserTransformer, user),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.logger.warn('AuthController', `Failed login attempt for email: ${loginDto.email}`);
        throw error;
      }

      if (error instanceof PrismaClientKnownRequestError) {
        this.logger.error('AuthController', `Database error during login: ${error.code}`, error.message);
        throw new BadRequestException('Invalid input data');
      }

      this.logger.error('AuthController', 'Error during login', error instanceof Error ? error.message : 'Unknown error');
      throw new InternalServerErrorException('Internal server error occurred');
    }
  }
}