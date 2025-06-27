import { ApiProperty } from "@nestjs/swagger";

export class BookTransformer 
{
    @ApiProperty({
        description: 'The title of the book',
        example: 'The Great Gatsby'
    })
    title: string;

    @ApiProperty({
        description: 'Total number of pages in the book',
        example: 180
    })
    numberOfPages: number;

    @ApiProperty({
        description: 'Number of pages read by the user',
        example: 50
    })
    numberOfReadPages: number;
}