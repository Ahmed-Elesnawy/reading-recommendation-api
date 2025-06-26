import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { SingleIntervalDto } from "../dto/single-interval.dto";
import { InjectQueue } from "@nestjs/bullmq";
import { BOOKS_CALCULATE_READING_INTERVAL_QUEUE } from "../constants";
import { Queue } from "bullmq";

@Injectable()
export class ReadingIntervalService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(BOOKS_CALCULATE_READING_INTERVAL_QUEUE) 
    private readonly calculateReadingIntervalQueue: Queue
  ) {}

  async createReadingInterval(userId: number, intervals: SingleIntervalDto[]): Promise<number> {
    const readingIntervals = await this.prisma.readingInterval.createMany({
      data: intervals.map((interval) => ({
        startPage: interval.startPage,
        endPage: interval.endPage,
        bookId: interval.bookId,
        userId: userId,
      })),
      skipDuplicates: true,
    });

    const shouldRecalculate: boolean = readingIntervals.count > 0;

    if (shouldRecalculate) {
      const bookIds: number[] = [...new Set(intervals.map((interval) => interval.bookId))];
      await this.addToCalculateQueue(bookIds);
    }

    return readingIntervals.count;
  }

  private async addToCalculateQueue(bookIds: number[]): Promise<void> {
    for (const bookId of bookIds) {
      await this.calculateReadingIntervalQueue.add(
        BOOKS_CALCULATE_READING_INTERVAL_QUEUE,
        {
          bookId: bookId,
        }
      );
    }
  }
}