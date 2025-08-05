import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { epubToKepub, extractCoverImage, extractMetadata, generateUniqueIdentifier, writeKepubFile } from "@/lib/backendUtils";
import { insertBook } from "@/db/insertions";

// Map of MIME types to handlers for processing that type of file
const fileFormatConverters: Map<string, (file: File) => Promise<File>> = new Map();
fileFormatConverters.set("application/epub+zip", async (file) => await epubToKepub(file)); // Convert EPUB to KEPUB
fileFormatConverters.set('application/octet-stream', async (file) => file); // already in kepub format so we can just return it as is

export async function POST(req: Request) {
    const session = await auth();
    const whitelist = process.env.WHITELIST?.split(",").map(email => email.trim()) || []
    const isWhiteListed = whitelist.includes(session?.user?.email ?? "");
    if (!isWhiteListed) {
        return new NextResponse("You must be logged in to upload a book", { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('file');

    for (const file of files) {
        if (!(file instanceof File)) {
            console.warn("Invalid object passed to backend, expected a File instance"); 
            continue;
        };

        const converter = fileFormatConverters.get(file.type);
        if (!converter) return new NextResponse(`File not of allowed type`, { status: 400 });

        const convertedFile = await converter(file);            // Convert the file to KEPUB format if necessary
        const bookID = await generateUniqueIdentifier(file);    // Generate a unique file ID based on the file's content, we use file instead of convertedFile here because kebupify is nondeterministic
        await writeKepubFile(convertedFile, bookID);            // Now we write this kepub file to the public/books folder
        const data = await extractMetadata(bookID);             // And we extract metadata and the manifest from the newly written file
        const coverWriteResult = await extractCoverImage(data, bookID);       // We also extract the cover image from the file, this is optional so we don't check for it

        if (coverWriteResult instanceof Error) {
            console.error(`Error extracting cover image for book with ID ${bookID}`);
            return new NextResponse(`Error extracting cover image for book with ID ${bookID}`, { status: 500 });
        }

        const insertionResult = await insertBook(bookID, data.metadata, coverWriteResult);      // Finally we insert the book into the database

        if(insertionResult instanceof Error) {
            console.error(`Error inserting book: ${insertionResult.message}`);
            return new NextResponse(`Error inserting book: ${insertionResult.message}`, { status: 500 });
        }
    }
    return NextResponse.json({ success: true});
}