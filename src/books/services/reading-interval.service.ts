import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { InjectQueue } from "@nestjs/bullmq";
import { BOOKS_CALCULATE_READING_INTERVAL_QUEUE } from "../constants";
import { Queue } from "bullmq";
import { CreateBookIntervalsDto } from "../dto";

@Injectable()
export class ReadingIntervalService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(BOOKS_CALCULATE_READING_INTERVAL_QUEUE)
    private readonly calculateReadingIntervalQueue: Queue
  ) { }

  async createReadingInterval(userId: number, createBookIntervalsDto: CreateBookIntervalsDto): Promise<number> {

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

    return readingIntervals.count;
  }

  public allIntervalsForSameBook(createBookIntervalsDto: CreateBookIntervalsDto) : boolean {
    const { intervals } = createBookIntervalsDto;

    const allBooksForSameBook : boolean = createBookIntervalsDto.intervals.every((interval) => interval.bookId === intervals[0].bookId);

    return allBooksForSameBook;
  }

  public async bookShouldBeExisted(createBookIntervalsDto: CreateBookIntervalsDto) : Promise<boolean> {
    const { intervals } = createBookIntervalsDto;

    const bookId = intervals[0].bookId;

    if (!bookId) {
      return false;
    }
    
    const book = await this.prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });

    return book !== null;
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