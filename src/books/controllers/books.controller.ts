import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { CreateBookService } from "../services/create-book.service";
import { CreateBookDto } from "../dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { UserType } from "@prisma/client";
import { ApiTags } from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";
import { BookTransformer } from "../transformers/book.transformer";
import { LoggerService } from "src/logger/logger.service";
import { CreateBookSwagger } from "../decorators/swagger/create-book.swagger";
import { CreateBookResponseDto } from "../dto/responses/create-book-response.dto";

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(private readonly createBookService: CreateBookService, private readonly logger: LoggerService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @CreateBookSwagger()
  async createBook(@Body() book: CreateBookDto): Promise<CreateBookResponseDto> {
    try {
      const createdBook = await this.createBookService.createBook(book);
      return {
        message: 'Book created successfully',
        book: BookTransformer.fromBook(createdBook)
      };
    } catch (error) {
      this.logger.error(BooksController.name, error, error.message);
      throw error;
    }
  }
}