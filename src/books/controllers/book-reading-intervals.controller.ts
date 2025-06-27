import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
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
import { LoggerService } from "src/logger/logger.service";
import { Book } from "@prisma/client";

@ApiTags('Books')
@Controller('books')
export class BookReadingIntervalsController {
  constructor(
    private readonly readingIntervalService: ReadingIntervalService,
    private readonly logger: LoggerService
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

    const allIntervalsForSameBook = this.readingIntervalService.allIntervalsForSameBook(createBookIntervalsDto);

    if (!allIntervalsForSameBook) {
      throw new BadRequestException("All intervals must be for the same book");
    }

    const book : Book | null = await this.readingIntervalService.findBookFromIntervals(createBookIntervalsDto);

    if (!book) {
      throw new BadRequestException("Book not found");
    }

    const intervalsEndPageShouldBeSmallerThanBookPages = this.readingIntervalService.intervalsEndPageShouldBeSmallerThanBookPages(book,createBookIntervalsDto);

    if (!intervalsEndPageShouldBeSmallerThanBookPages) {
      throw new BadRequestException("Intervals end pages should be smaller than book pages");
    }
  
    try {
      await this.readingIntervalService.createReadingInterval(
        user.id, 
        createBookIntervalsDto
      );
    } catch (error) {
      this.logger.error(BookReadingIntervalsController.name, error, error.message);
      throw new BadRequestException("Error creating reading intervals");
    }

    return {
      status: "success",
    };
  }
}