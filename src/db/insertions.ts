import { db } from "@/db";
import { books as booksTable } from "@/db/schema";


export async function insertBook(fileName: string, metadata: any): Promise<Error | undefined> {
  try{
    await db.insert(booksTable).values({
        title: metadata.title || "unknown",
        creator: metadata.creator || "unknown",
        releasedate: metadata.date || "unknown",
        language: metadata.language || "unknown",
        publisher: metadata.publisher || "unknown",
        subjects: metadata.subjects?.join(", ")  || "unknown",
        filename: fileName,
    }).run();
    return undefined; 
  } catch (e: any) {
    return e;
  }
}