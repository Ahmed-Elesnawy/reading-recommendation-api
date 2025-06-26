import { BadRequestException, Body, ConflictException, Controller, HttpCode, HttpStatus, InternalServerErrorException, Post, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { RegisterUserDto } from "../dto/register-user.dto";
import { ApiTags } from "@nestjs/swagger";
import { UserTransformer } from "../transformers/user.transformer";
import { plainToInstance } from "class-transformer";
import { LoggerService } from "../../logger/logger.service";
import { LoginDto } from "../dto/login.dto";
import { LoginResponseDto, RegisterResponseDto } from "../dto/auth-response.dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { LoginSwagger, RegisterSwagger } from "../decorators/swagger";

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @RegisterSwagger()
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
  @LoginSwagger()
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    try {
      const { access_token, user } = await this.authService.login(loginDto);
      
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