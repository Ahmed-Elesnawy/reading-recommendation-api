import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { ReadingIntervalService } from "../services/reading-interval.service";
import { CreateBookIntervalsDto } from "../dto";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { User, UserType } from "@prisma/client";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { ReadingIntervalResponseDto } from "../dto/responses/reading-interval-response.dto";
import { CreateReadingIntervalsSwagger } from "../decorators/swagger/reading-intervals.swagger";

@ApiTags('Books')
@Controller('books')
export class BookReadingIntervalsController {
  constructor(
    private readonly readingIntervalService: ReadingIntervalService
  ) {}

  @Post('reading-intervals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.USER)
  @HttpCode(HttpStatus.CREATED)
  @CreateReadingIntervalsSwagger()
  async createReadingInterval(
    @Body() createBookIntervalsDto: CreateBookIntervalsDto, 
    @CurrentUser() user: User
  ): Promise<ReadingIntervalResponseDto> {
    const readingIntervals = await this.readingIntervalService.createReadingInterval(
      user.id, 
      createBookIntervalsDto.intervals
    );

    return {
      status: "success",
      readingIntervals,
      message: `Successfully created ${readingIntervals} reading intervals`
    };
  }
}