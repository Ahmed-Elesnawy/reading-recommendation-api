-- DropIndex
DROP INDEX "reading_intervals_start_page_idx";

-- CreateIndex
CREATE INDEX "reading_intervals_book_id_idx" ON "reading_intervals"("book_id");
