import { auth } from "@/auth";
import { BookCard } from "@/components/book/book-card";
import type { Book } from "@/lib/types";
import { db } from "@/db";
import { books as booksTable } from "@/db/schema";

import FileUpload from "@/components/file-upload";
import { getBooks } from "@/lib/searchUtils";
import SearchBar from "./book-searchbar";

export default async function CardGrid() {
  const session = await auth();

  if (!session?.user)
    return (
      <main className="flex flex-1 justify-center">
        <p className="mt-8 text-muted-foreground">Log in to view books</p>
      </main>
    );

  
  let books: Book[] = await getBooks();
  let otherbooks: Book[] = await getBooks();
  return (
    <main className="flex flex-1 flex-col items-center relative mb-14">
      <p className="mt-8 text-muted-foreground mb-6">
        Welcome, {session.user.name}!
      </p>
      <SearchBar books={otherbooks}></SearchBar>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-6 w-full max-w-6xl">
        {books.map((book, index) => (
          <BookCard key={index} book={book} />
        ))}
      </div>
      <div className="absolute top-4 right-4">
        <FileUpload />
      </div>
    </main>
  );
}
