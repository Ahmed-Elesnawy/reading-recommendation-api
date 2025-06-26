import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersRepository } from "../repositories/users.repository";
import { Prisma, User } from "@prisma/client";
import { RegisterUserDto } from "../dto/register-user.dto";
import { LoginDto } from "../dto/login.dto";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const salt : number = 10;
    const user = await this.usersRepository.create({
      ...registerUserDto,
      password: await bcrypt.hash(registerUserDto.password, salt),
    });
    
    return user;
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.usersRepository.findOne({ email: loginDto.email });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}