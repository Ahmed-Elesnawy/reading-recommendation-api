import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CalculateReadPagesService {
  private readonly BATCH_SIZE = 1000; // Process 1000 intervals at a time

  constructor(private readonly prisma: PrismaService) {}

  async calculate(bookId: number): Promise<void> {
      const intervals = await this.getReadingIntervals(bookId);

      if (!intervals.length) {
        return;
      }

      const mergedIntervals: { startPage: number; endPage: number }[] =
        this.mergeOverlappingIntervals(intervals);
      const totalPagesRead: number =
        this.calculateTotalUniquePages(mergedIntervals);

      await this.updateBookReadPages(bookId, totalPagesRead);
  }

  /**
   * Version 2 of calculate method that uses offset-based pagination
   * for efficient processing of large amounts of reading intervals
   */
  async calculateUsingPatchProcessing(bookId: number): Promise<void> {
    let offset = 0;
    let allIntervals: { startPage: number; endPage: number }[] = [];

    while (true) {
      const batch = await this.getReadingIntervalsBatch(bookId, offset);
      
      if (batch.length === 0) {
        break;
      }

      // Accumulate all intervals first
      allIntervals.push(...batch);
      offset += this.BATCH_SIZE;

      // If we got less than batch size, we're done
      if (batch.length < this.BATCH_SIZE) {
        break;
      }
    }

    if (!allIntervals.length) {
      return;
    }

    // Now process all intervals at once (they're already sorted by startPage)
    const mergedIntervals = this.mergeOverlappingIntervals(allIntervals);
    const totalPagesRead = this.calculateTotalUniquePages(mergedIntervals);
    await this.updateBookReadPages(bookId, totalPagesRead);
  }

  private async getReadingIntervals(
    bookId: number,
  ): Promise<{ startPage: number; endPage: number }[]> {
    const intervals = await this.prisma.readingInterval.findMany({
      where: { bookId },
      select: {
        startPage: true,
        endPage: true,
      },
      orderBy: { startPage: 'asc' },
    });

    return intervals;
  }

  /**
   * Fetch a batch of reading intervals using offset-based pagination
   */
  private async getReadingIntervalsBatch(
    bookId: number,
    offset: number,
  ): Promise<{ startPage: number; endPage: number }[]> {
    const intervals = await this.prisma.readingInterval.findMany({
      where: { bookId },
      select: {
        startPage: true,
        endPage: true,
      },
      orderBy: { startPage: 'asc' },
      skip: offset,
      take: this.BATCH_SIZE,
    });

    return intervals;
  }

  private mergeOverlappingIntervals(
    intervals: { startPage: number; endPage: number }[],
  ): { startPage: number; endPage: number }[] {
    const mergedIntervals: { startPage: number; endPage: number }[] = [];
    let currentInterval = { ...intervals[0] };

    for (let i = 1; i < intervals.length; i++) {
      const interval = intervals[i];

      if (interval.startPage <= currentInterval.endPage + 1) {
        // Merge overlapping or adjacent intervals
        currentInterval.endPage = Math.max(
          currentInterval.endPage,
          interval.endPage,
        );
      } else {
        mergedIntervals.push(currentInterval);
        currentInterval = { ...interval };
      }
    }

    mergedIntervals.push(currentInterval);

    return mergedIntervals;
  }

  private calculateTotalUniquePages(
    intervals: { startPage: number; endPage: number }[],
  ): number {
    return intervals.reduce((sum, interval) => {
      return sum + (interval.endPage - interval.startPage + 1);
    }, 0);
  }

  private async updateBookReadPages(
    bookId: number,
    totalPagesRead: number,
  ): Promise<void> {
    await this.prisma.book.update({
      where: { id: bookId },
      data: { numberOfReadPages: totalPagesRead },
    });
  }
}
