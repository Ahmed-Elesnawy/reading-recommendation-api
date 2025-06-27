import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { BOOKS_CALCULATE_READING_INTERVAL_QUEUE } from '../constants';
import { Queue } from 'bullmq';
import { CreateBookIntervalsDto } from '../dto';
import { Book } from '@prisma/client';

@Injectable()
export class ReadingIntervalService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(BOOKS_CALCULATE_READING_INTERVAL_QUEUE)
    private readonly calculateReadingIntervalQueue: Queue,
  ) {}

  async createReadingInterval(
    userId: number,
    createBookIntervalsDto: CreateBookIntervalsDto,
  ): Promise<void> {
    // Validate all business rules before proceeding
    await this.validateReadingIntervals(createBookIntervalsDto);

    const readingIntervals = await this.prisma.readingInterval.createMany({
      data: createBookIntervalsDto.intervals.map((interval) => ({
        startPage: interval.startPage,
        endPage: interval.endPage,
        bookId: interval.bookId,
        userId: userId,
      })),
      skipDuplicates: true,
    });

    const shouldRecalculate: boolean = readingIntervals.count > 0;

    // Because its for the same book
    if (shouldRecalculate) {
      const bookId = createBookIntervalsDto.intervals[0].bookId;
      await this.addToCalculateQueue(bookId);
    }
  }

  /**
   * Validates all business rules for reading intervals
   * @throws BadRequestException if any validation fails
   */
  private async validateReadingIntervals(
    createBookIntervalsDto: CreateBookIntervalsDto,
  ): Promise<void> {
    if (!this.allIntervalsForSameBook(createBookIntervalsDto)) {
      throw new BadRequestException('All intervals must be for the same book');
    }

    const book = await this.findBookFromIntervals(createBookIntervalsDto);
    if (!book) {
      throw new BadRequestException('Book not found');
    }

    if (
      !this.intervalsEndPageShouldBeSmallerThanBookPages(
        book,
        createBookIntervalsDto,
      )
    ) {
      throw new BadRequestException(
        'Intervals end pages should be smaller than book pages',
      );
    }
  }

  private allIntervalsForSameBook(
    createBookIntervalsDto: CreateBookIntervalsDto,
  ): boolean {
    const { intervals } = createBookIntervalsDto;
    return intervals.every(
      (interval) => interval.bookId === intervals[0].bookId,
    );
  }

  private async findBookFromIntervals(
    createBookIntervalsDto: CreateBookIntervalsDto,
  ): Promise<Book> {
    const { intervals } = createBookIntervalsDto;
    const bookId = intervals[0].bookId;

    if (!bookId) {
      return null;
    }

    return await this.prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });
  }

  private intervalsEndPageShouldBeSmallerThanBookPages(
    book: Book,
    createBookIntervalsDto: CreateBookIntervalsDto,
  ): boolean {
    const { intervals } = createBookIntervalsDto;
    return intervals.every(
      (interval) => interval.endPage <= book.numberOfPages,
    );
  }

  private async addToCalculateQueue(bookId: number) {
    await this.calculateReadingIntervalQueue.add(
      BOOKS_CALCULATE_READING_INTERVAL_QUEUE,
      {
        bookId: bookId,
      },
    );
  }
}
