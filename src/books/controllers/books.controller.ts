import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { CreateBookService } from "../services/create-book.service";
import { CreateBookDto } from "../dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { UserType } from "@prisma/client";
import { ApiBearerAuth } from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";
import { BookTransformer } from "../transformers/book.transformer";


@Controller('books')
export class BooksController {
  constructor(private readonly createBookService: CreateBookService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  async createBook(@Body() book: CreateBookDto) {
    const createdBook = await this.createBookService.createBook(book);
    return plainToInstance(BookTransformer, createdBook);
  }
}