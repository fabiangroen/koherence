import { db } from "@/db";
import { eq } from "drizzle-orm";
import { books as booksTable } from "@/db/schema";
import { users } from "@/db/schema";

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
        subjects:
          metadata.subject ??
          (Array.isArray(metadata.subjects)
            ? metadata.subjects.join(", ")
            : typeof metadata.subjects === "string"
              ? metadata.subjects
              : "unknown"),
        imageFileExtension: imageFileExtension.replace(".", "") || ".jpg",
      })
      .run();
    return undefined;
  } catch (e: any) {
    return e;
  }
}

export async function getUserById(id: string) {
  return db.select().from(users).where(eq(users.id, id));
}

export async function insertUser(
  id: string,
  email: string,
  name: string,
  image: string,
  role: string,
): Promise<Error | undefined> {
  try {
    await db.insert(users).values({ id, email, name, image, role });
  } catch (e: any) {
    return e;
  }
}
