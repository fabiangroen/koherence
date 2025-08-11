import { auth } from "@/auth";
import { db } from "@/db";
import { books as booksTable } from "@/db/schema";
import type { Book } from "@/lib/types";
import BooksTableClient from "./books-table-client";

interface ExtendedBook extends Book {
  language: string;
  publisher: string;
}

export default async function BooksTable() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Authentication required</p>
      </div>
    );
  }

  const rawBooks = await db.select().from(booksTable);
  const books: ExtendedBook[] = rawBooks.map((b) => ({
    author: b.creator,
    title: b.title,
    releaseDate: b.releasedate.slice(0, 4),
    coverImg: `/api/cover/${b.id}/${b.imageFileExtension}`,
    id: b.id,
    language: b.language,
    publisher: b.publisher,
  }));

  return <BooksTableClient books={books} />;
}
