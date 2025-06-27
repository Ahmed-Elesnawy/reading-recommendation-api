import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SingleIntervalDto } from './single-interval.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookIntervalsDto {
  @ApiProperty({
    description: 'Array of reading intervals',
    type: [SingleIntervalDto],
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleIntervalDto)
  intervals: SingleIntervalDto[];
}
