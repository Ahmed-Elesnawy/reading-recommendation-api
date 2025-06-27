import { ApiProperty } from "@nestjs/swagger";
import { Book } from "@prisma/client";

export class BookTransformer 
{
    @ApiProperty({
        description: 'The ID of the book',
        example: 1
    })

    book_id: number;

    @ApiProperty({
        description: 'The title of the book',
        example: 'The Great Gatsby'
    })
    book_title: string;

    @ApiProperty({
        description: 'Total number of pages in the book',
        example: 180
    })
    num_of_pages: number;

    @ApiProperty({
        description: 'Number of pages read by the user',
        example: 50
    })
    num_of_read_pages: number;


    static fromBook(book: Book): BookTransformer {
        return {
            book_id: book.id,
            book_title: book.title,
            num_of_pages: book.numberOfPages,
            num_of_read_pages: book.numberOfReadPages
        }
    }
}