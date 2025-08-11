import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  epubToKepub,
  extractCoverImage,
  extractMetadata,
  generateUniqueIdentifier,
  writeKepubFile,
} from "@/lib/backendUtils";
import { insertBook } from "@/db/insertions";
import { db } from "@/db";
import { books as booksTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await auth();

  if (!session) {
    return new NextResponse("You must be logged in to upload a book", {
      status: 401,
    });
  }

  const formData = await req.formData();
  const files = formData.getAll("file");

  for (const file of files) {
    if (!(file instanceof File)) {
      console.warn("Invalid object passed to backend, expected a File instance");
      continue;
    }

    if (file.type != "application/epub+zip") {
      console.warn("Invalid object passed to backend, expected an EPUB file and got a file with type: ", file.type);
      continue;
    }
    const convertedFile = await epubToKepub(file); // Convert the file to KEPUB format. Does nothing if already in KEPUB format
    const bookID = await generateUniqueIdentifier(file); // Generate a unique file ID based on the file's content, we use file instead of convertedFile here because kebupify is nondeterministic

    // Check if book already exists in database
    const existingBook = await db
      .select()
      .from(booksTable)
      .where(eq(booksTable.id, bookID))
      .get();
    if (existingBook) {
      return new NextResponse(
        JSON.stringify({
          error: "DUPLICATE_BOOK",
          message: `This book already exists in the library`,
        }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      );
    }

    await writeKepubFile(convertedFile, bookID); // Now we write this kepub file to the public/books folder
    const data = await extractMetadata(bookID); // And we extract metadata and the manifest from the newly written file
    const coverWriteResult = await extractCoverImage(data, bookID); // We also extract the cover image from the file, this is optional so we don't check for it

    let coverImagePath: string;
    if (coverWriteResult instanceof Error) {
      console.error(
        `Error extracting cover image for book with ID ${bookID}: ${coverWriteResult.message}`,
      );
      coverImagePath = "none";
    } else {
      coverImagePath = coverWriteResult;
    }

    const insertionResult = await insertBook(
      bookID,
      data.metadata,
      coverImagePath,
    ); // Finally we insert the book into the database

    if (insertionResult instanceof Error) {
      console.error(`Error inserting book: ${insertionResult.message}`);
      return new NextResponse(
        JSON.stringify({
          error: "BOOK_INSERTION_FAILED",
          message: insertionResult.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  }
  return NextResponse.json({ success: true });
}
