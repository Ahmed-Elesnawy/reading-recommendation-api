import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Book } from '@prisma/client';

@Injectable()
export class TopBooksService {
  constructor(private readonly prisma: PrismaService) {}

  async getTopBooks(limit = 5): Promise<Book[]> {
    return this.prisma.book.findMany({
      orderBy: {
        numberOfReadPages: 'desc',
      },
      take: limit,
    });
  }
}
