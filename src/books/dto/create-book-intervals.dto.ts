import { IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { SingleIntervalDto } from "./single-interval.dto";

export class CreateBookIntervalsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleIntervalDto)
  intervals: SingleIntervalDto[];
}