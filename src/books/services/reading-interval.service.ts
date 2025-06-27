import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { InjectQueue } from "@nestjs/bullmq";
import { BOOKS_CALCULATE_READING_INTERVAL_QUEUE } from "../constants";
import { Queue } from "bullmq";
import { CreateBookIntervalsDto } from "../dto";
import { Book } from "@prisma/client";

@Injectable()
export class ReadingIntervalService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(BOOKS_CALCULATE_READING_INTERVAL_QUEUE)
    private readonly calculateReadingIntervalQueue: Queue
  ) { }

  async createReadingInterval(userId: number, createBookIntervalsDto: CreateBookIntervalsDto): Promise<void> {

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
    const bookId: number = createBookIntervalsDto.intervals[0].bookId;

    if (shouldRecalculate) {
      await this.addToCalculateQueue(bookId);
    }

  }

  public allIntervalsForSameBook(createBookIntervalsDto: CreateBookIntervalsDto) : boolean {
    const { intervals } = createBookIntervalsDto;

    const allBooksForSameBook : boolean = createBookIntervalsDto.intervals.every((interval) => interval.bookId === intervals[0].bookId);

    return allBooksForSameBook;
  }

  public async findBookFromIntervals(createBookIntervalsDto: CreateBookIntervalsDto) : Promise<Book> {
    const { intervals } = createBookIntervalsDto;

    const bookId = intervals[0].bookId;

    if (!bookId) {
      return null
    }
    
    const book = await this.prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });

    return book;
  }


  public intervalsEndPageShouldBeSmallerThanBookPages(book: Book,createBookIntervalsDto: CreateBookIntervalsDto) : boolean {
    const { intervals } = createBookIntervalsDto;

    const allIntervalsEndPageShouldBeSmallerThanBookPages : boolean = intervals.every((interval) => interval.endPage <= book.numberOfPages);

    return allIntervalsEndPageShouldBeSmallerThanBookPages;
  }

  private async addToCalculateQueue(bookId: number) {
    await this.calculateReadingIntervalQueue.add(
      BOOKS_CALCULATE_READING_INTERVAL_QUEUE,
      {
        bookId: bookId,
      }
    );
  }
}