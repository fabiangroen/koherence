

import { db } from "@/db";
import { books as booksTable } from "@/db/schema";
import { Book, bookCollection } from "./types";
import MiniSearch, { SearchOptions, SearchResult } from "minisearch";
import { makeSearchableCollection } from "./clientSearchUtils";

export async function getBooks(): Promise<Book[]> {
  return (await db.select().from(booksTable)).map((b) => ({
    author: b.creator,
    title: b.title,
    releaseDate: b.releasedate.slice(0, 4),
    coverImg: `/api/cover/${b.id}/${b.imageFileExtension}`,
    id: b.id,
  }));
}

export async function getBookCollection(): Promise<bookCollection> {
  return makeSearchableCollection(await getBooks());
}
