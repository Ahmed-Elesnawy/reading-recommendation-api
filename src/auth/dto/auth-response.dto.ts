import { ApiProperty } from "@nestjs/swagger";
import { UserTransformer } from "../transformers/user.transformer";

export class BaseAuthResponseDto {
    @ApiProperty({
        description: 'Response message',
        example: 'Operation completed successfully'
    })
    message: string;

    @ApiProperty({
        description: 'User information',
        type: UserTransformer
    })
    user: UserTransformer;
}

export class RegisterResponseDto extends BaseAuthResponseDto {
    @ApiProperty({
        description: 'Response message',
        example: 'User registered successfully'
    })
    message: string;
}

export class LoginResponseDto extends BaseAuthResponseDto {
    @ApiProperty({
        description: 'Response message',
        example: 'User logged in successfully'
    })
    message: string;

    @ApiProperty({
        description: 'JWT access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    access_token: string;
} 