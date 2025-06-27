import { ApiProperty } from '@nestjs/swagger';
import { BookTransformer } from '../../transformers/book.transformer';

export class TopBooksResponseDto {
  @ApiProperty({
    description: 'List of top rated books',
    type: [BookTransformer],
    isArray: true,
  })
  books: BookTransformer[];
}
