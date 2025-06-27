import { UserType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UserTransformer {
  @ApiProperty({
    description: 'The id of the user',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  name: string;

  @ApiProperty({
    description: 'The type of user account',
    enum: UserType,
    example: UserType.USER,
  })
  type: UserType;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password',
  })
  @Exclude()
  password: string;
}
