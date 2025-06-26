import { IsInt, IsNotEmpty, Min } from "class-validator";

export class SingleIntervalDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  startPage: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  endPage: number;

  @IsInt()
  @IsNotEmpty()
  bookId: number;
}   