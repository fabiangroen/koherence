import { auth } from "@/auth";
import { db } from "@/db";
import { books as booksTable } from "@/db/schema";
import type { Book } from "@/lib/types";
import FileUpload from "@/components/file-upload";
import CardGridClient from "./card-grid.client";
import React from "react";

export default async function CardGrid() {
  const session = await auth();

  if (!session?.user)
    return (
      <main className="flex flex-1 justify-center">
        <p className="mt-8 text-muted-foreground">Log in to view books</p>
      </main>
    );

  const rawBooks = await db.select().from(booksTable);
  const books: Book[] = rawBooks.map((b) => ({
    author: b.creator,
    title: b.title,
    releaseDate: b.releasedate.slice(0, 4),
    coverImg: `/api/cover/${b.id}/${b.imageFileExtension}`,
    id: b.id,
  }));

  return (
    <main className="flex flex-1 flex-col items-center relative mb-14">
      <p className="mt-8 text-muted-foreground mb-6">
        Welcome, {session.user.name}!
      </p>

      <CardGridClient initialBooks={books} />

      <div className="absolute top-4 right-4">
        <FileUpload />
      </div>
    </main>
  );
}
