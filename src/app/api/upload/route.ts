import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { epubToKepub, extractMetadata, writeKepubFile } from "@/lib/backendUtils";
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
        if (!converter) throw new Error(`No handler for file type: ${file.type}`);

        const convertedFile = await converter(file);            // Convert the file to KEPUB format if necessary
        const fileName = await writeKepubFile(convertedFile);   // Now we write this kepub file to the public/books folder
        const metadata = await extractMetadata(fileName);       // And we extract metadata from the newly written file
        const result = await insertBook(fileName, metadata);    // Finally we insert the book into the database

        if(result instanceof Error) {
            console.error(`Error inserting book: ${result.message}`);
            return new NextResponse(`Error inserting book: ${result.message}`, { status: 500 });
        }
    }
    return NextResponse.json({ success: true});
}