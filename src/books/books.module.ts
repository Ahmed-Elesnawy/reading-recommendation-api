import { Module } from "@nestjs/common";
import { ReadingIntervalService } from "./services/reading-interval.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { BullModule } from "@nestjs/bullmq";
import { BOOKS_CALCULATE_READING_INTERVAL_QUEUE } from "./constants";
import { BookReadingIntervalsController } from "./controllers/book-reading-intervals.controller";
import { LoggerModule } from "src/logger/logger.module";
import { CalculateReadPagesConsumer } from "./queue-consumers/calculate-read-pages.consumer";
import { CalculateReadPagesService } from "./services";
import { TopBooksController } from "./controllers/top-books.controller";
import { TopBooksService } from "./services/top-books.service";
import { BooksController } from "./controllers/books.controller";
import { CreateBookService } from "./services/create-book.service";


@Module({
  imports: [PrismaModule, BullModule.registerQueue({
    name: BOOKS_CALCULATE_READING_INTERVAL_QUEUE,
  }), LoggerModule],
  providers: [ReadingIntervalService,CalculateReadPagesConsumer,CalculateReadPagesService,TopBooksService,CreateBookService],
  controllers: [BookReadingIntervalsController,TopBooksController,BooksController],
  exports: [ReadingIntervalService],
})
export class BooksModule {}