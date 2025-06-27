import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async checkIfUserExists(email: string): Promise<boolean> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    return existingUser ? true : false;
  }

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const userExists = await this.checkIfUserExists(registerUserDto.email);

    if (userExists) {
      throw new ConflictException('User already exists');
    }

    const salt = 10;

    const user = await this.prisma.user.create({
      data: {
        ...registerUserDto,
        password: await bcrypt.hash(registerUserDto.password, salt),
      },
    });

    return user;
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ access_token: string; user: User }> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user,
    };
  }
}
