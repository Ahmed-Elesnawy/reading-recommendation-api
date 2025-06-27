import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReadingIntervalService } from '../services/reading-interval.service';
import { CreateBookIntervalsDto } from '../dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User, UserType } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ReadingIntervalResponseDto } from '../dto/responses/reading-interval-response.dto';
import { CreateReadingIntervalsSwagger } from '../decorators/swagger/reading-intervals.swagger';
import { LoggerService } from 'src/logger/logger.service';

@ApiTags('Books')
@Controller('books')
export class BookReadingIntervalsController {
  constructor(
    private readonly readingIntervalService: ReadingIntervalService,
    private readonly logger: LoggerService,
  ) {}

  @Post('reading-intervals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.USER)
  @HttpCode(HttpStatus.CREATED)
  @CreateReadingIntervalsSwagger()
  async createReadingInterval(
    @Body() createBookIntervalsDto: CreateBookIntervalsDto,
    @CurrentUser() user: User,
  ): Promise<ReadingIntervalResponseDto> {
    try {
      await this.readingIntervalService.createReadingInterval(
        user.id,
        createBookIntervalsDto,
      );
    } catch (error) {
      this.logger.error(
        BookReadingIntervalsController.name,
        error,
        error.message,
      );
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException('Error creating reading intervals');
    }

    return {
      status: 'success',
    };
  }
}
