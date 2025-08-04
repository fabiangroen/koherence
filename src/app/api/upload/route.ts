import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { books as booksTable } from "@/db/schema";
import { epubToKepub } from "@/lib/backendUtils";

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
        if( !converter) {
            return new NextResponse(`No handler for file type: ${file.type}`, { status: 400 });
        }
        const convertedFile: File = await converter(file) 
        console.log("Converted file: ", convertedFile);
        // Here, we still have to save the file to the filesystem, extract metadata, and save it to the database
    }
    return NextResponse.json({ success: true});
}