import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CalculateReadPagesService {

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
