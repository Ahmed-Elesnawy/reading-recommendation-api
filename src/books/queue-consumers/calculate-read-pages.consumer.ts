import { Processor, WorkerHost } from '@nestjs/bullmq';
import { BOOKS_CALCULATE_READING_INTERVAL_QUEUE } from '../constants';
import { Job } from 'bullmq';
import { CalculateReadPagesService } from '../services';
import { LoggerService } from 'src/logger/logger.service';

@Processor(BOOKS_CALCULATE_READING_INTERVAL_QUEUE)
export class CalculateReadPagesConsumer extends WorkerHost {
  constructor(
    private readonly calculateReadPagesService: CalculateReadPagesService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async process(job: Job<{ bookId: number }>) {
    try {
      await this.calculateReadPagesService.calculate(job.data.bookId);
    } catch (error) {
      this.logger.error(CalculateReadPagesConsumer.name, error, error.message);
    }
  }
}
