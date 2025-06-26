import { Module } from "@nestjs/common";
import { ReadingIntervalService } from "./services/reading-interval.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { BullModule } from "@nestjs/bullmq";
import { BOOKS_CALCULATE_READING_INTERVAL_QUEUE } from "./constants";
import { BookReadingIntervalsController } from "./controllers/book-reading-intervals.controller";
import { LoggerModule } from "src/logger/logger.module";

@Module({
  imports: [PrismaModule, BullModule.registerQueue({
    name: BOOKS_CALCULATE_READING_INTERVAL_QUEUE,
  }), LoggerModule],
  providers: [ReadingIntervalService],
  controllers: [BookReadingIntervalsController],
  exports: [ReadingIntervalService],
})
export class BooksModule {}