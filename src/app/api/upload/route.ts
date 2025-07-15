import { writeFile, unlink } from "fs/promises"
import { join } from "path"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EPUB_DIR, KEPUB_DIR, UPLOAD_DIR, createUniqueFilename, ensureDirectories } from "@/lib/file-utils"
import { extractEpubMetadata } from "@/lib/epub-metadata"
import { convertToKepub } from "@/lib/kepub"
import { handleKepubifyError } from "@/lib/error"

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get("file") as File

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            )
        }

        // Validate file type
        if (!file.name.endsWith(".epub")) {
            return NextResponse.json(
                { error: "Invalid file type. Only .epub files are allowed" },
                { status: 400 }
            )
        }

        // Ensure directories exist and create unique filename
        await ensureDirectories()
        const filename = createUniqueFilename(file.name)
        const epubPath = join(EPUB_DIR, filename)

        // Save the original epub file
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(epubPath, buffer)

        let extractedMetadata;
        try {
            // Extract metadata from epub
            extractedMetadata = await extractEpubMetadata(epubPath)
            if (!extractedMetadata) {
                throw new Error("Failed to extract metadata from epub")
            }

            // Convert to kepub format
            const conversionResult = await convertToKepub(epubPath)
            if (!conversionResult.success) {
                throw new Error(handleKepubifyError(new Error(conversionResult.error || "")))
            }

            // Save book entry with metadata
            const book = await prisma.book.create({
                data: {
                    title: extractedMetadata.title,
                    author: extractedMetadata.author,
                    cover: extractedMetadata.cover, // Already includes covers/ prefix from metadata extraction
                    originalPath: join("epub", filename),
                    filePath: join("kepub", filename.replace(".epub", ".kepub")),
                    userId: session.user.id,
                    metadata: JSON.stringify({
                        language: extractedMetadata.language,
                        description: extractedMetadata.description,
                        publisher: extractedMetadata.publisher,
                        publishDate: extractedMetadata.publishDate,
                    }),
                },
            })

            return NextResponse.json({
                success: true,
                book,
                metadata: {
                    title: extractedMetadata.title,
                    author: extractedMetadata.author,
                    cover: Boolean(extractedMetadata.cover),
                },
                convertedTo: "kepub"
            })
        } catch (error) {
            // Clean up uploaded files if processing fails
            await Promise.all([
                unlink(epubPath).catch(() => { }),
                unlink(epubPath.replace(".epub", ".kepub")).catch(() => { }),
                extractedMetadata?.cover && unlink(join(UPLOAD_DIR, extractedMetadata.cover)).catch(() => { }),
            ])
            throw error
        }
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? handleKepubifyError(error) : "Internal server error" },
            { status: 500 }
        )
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
}
