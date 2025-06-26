import { UserType } from "@prisma/client";
import { IsEmail, IsEnum, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class RegisterUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(UserType)
  type: UserType;
}