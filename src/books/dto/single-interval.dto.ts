import { IsInt, IsNotEmpty, Min, Validate } from "class-validator";
import { EndPageGreaterThanStartPageConstraint } from "../validators/end-page-greater-start-page.validator";

export class SingleIntervalDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  startPage: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Validate(EndPageGreaterThanStartPageConstraint)
  endPage: number;

  @IsInt()
  @IsNotEmpty()
  bookId: number;
}   