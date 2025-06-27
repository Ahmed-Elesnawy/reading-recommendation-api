import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookDto } from '../dto';
import { Book } from '@prisma/client';

@Injectable()
export class CreateBookService {
  constructor(private readonly prisma: PrismaService) {}

  async createBook(book: CreateBookDto): Promise<Book> {
    try {
      return await this.prisma.book.create({ data: book });
    } catch (error) {
      throw new BadRequestException('Error creating book');
    }
  }
}
