import { db } from "@/db";
import { books as booksTable } from "@/db/schema";

export async function insertBook(
  bookID: string,
  metadata: any,
  imageFileExtension: string,
): Promise<Error | undefined> {
  try {
    await db
      .insert(booksTable)
      .values({
        id: bookID,
        title: metadata.title || "unknown",
        creator: metadata.creator || "unknown",
        releasedate: metadata.date || "unknown",
        language: metadata.language || "unknown",
        publisher: metadata.publisher || "unknown",
        subjects: metadata.subject || metadata.subjects instanceof Array? metadata.subjects?.join(", ") : metadata.subjects || "unknown",
        imageFileExtension: imageFileExtension.replace(".", "") || ".jpg",
      })
      .run();
    return undefined;
  } catch (e: any) {
    return e;
  }
}
