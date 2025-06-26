import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
    format: 'email'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The password for the user account',
    example: 'StrongP@ssw0rd123',
    minLength: 8,
    format: 'password'
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}   