import { BadRequestException, Controller, Get, Query, UseGuards } from "@nestjs/common";
import { TopBooksService } from "../services/top-books.service";
import { LoggerService } from "src/logger/logger.service";
import { Book, UserType } from "@prisma/client";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";

@Controller('books')
export class TopBooksController {
    constructor(
        private readonly topBooksService: TopBooksService,
        private readonly logger: LoggerService
    ) {}

    @Get('top')
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(UserType.USER)
    async getTopBooks() : Promise<Book[]> {
        try {
            const topBooks = await this.topBooksService.getTopBooks();
            return topBooks
        } catch (error) {
            this.logger.error(TopBooksController.name, error, error.message);
            throw new BadRequestException("Error getting top books");
        }
    }
}