-- DropIndex
DROP INDEX "reading_intervals_book_id_idx";

-- DropIndex
DROP INDEX "users_email_idx";

-- CreateIndex
CREATE INDEX "reading_intervals_book_id_start_page_idx" ON "reading_intervals"("book_id", "start_page");
