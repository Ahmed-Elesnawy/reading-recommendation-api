import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SingleIntervalDto } from './single-interval.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookIntervalsDto {
  @ApiProperty({
    description: 'Array of reading intervals',
    type: [SingleIntervalDto],
    example: [
      {
        startPage: 1,
        endPage: 25,
        bookId: 1,
      },
      {
        startPage: 30,
        endPage: 45,
        bookId: 1,
      },
    ],
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleIntervalDto)
  intervals: SingleIntervalDto[];
}
