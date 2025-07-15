import { createReadStream, statSync } from "fs"
import { join, resolve } from "path"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { UPLOAD_DIR, getFilePath } from "@/lib/file-utils"

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Get and validate the file path
        const pathParam = await Promise.resolve(params.path)
        const safePath = pathParam.join("/")

        // Use our file utilities to resolve the path
        const filePath = getFilePath(safePath)
        const uploadDirPath = resolve(UPLOAD_DIR)

        console.log("Serving file:", {
            params: pathParam,
            safePath,
            filePath,
            uploadDir: uploadDirPath
        })

        // Security check: ensure the file is within the uploads directory
        if (!filePath.startsWith(uploadDirPath)) {
            console.error("Invalid path attempted:", filePath)
            return new NextResponse("Invalid path", { status: 400 })
        }

        // Check if file exists and is a file
        let stats: ReturnType<typeof statSync>
        try {
            stats = statSync(filePath)
            if (!stats.isFile()) {
                const err = `Requested path '${safePath}' exists but is not a file`
                console.error(err, { stats: JSON.stringify(stats, null, 2) })
                return new NextResponse(err, { status: 404 })
            }
        } catch (error) {
            const err = `File not found: ${safePath}`
            console.error(err, {
                requestedPath: safePath,
                resolvedPath: filePath,
                error: error instanceof Error ? error.message : String(error)
            })
            return new NextResponse(err, { status: 404 })
        }

        console.log("File access successful:", filePath)
        console.log("Stats:", { size: stats.size, mode: stats.mode })

        // Create a readable stream of the file
        const fileStream = createReadStream(filePath)

        // Determine content type based on file extension
        const ext = filePath.split(".").pop()?.toLowerCase() || ""
        const mimeTypes: Record<string, string> = {
            "epub": "application/epub+zip",
            "kepub": "application/epub+zip",
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "png": "image/png",
            "webp": "image/webp",
            "gif": "image/gif"
        }
        const contentType = mimeTypes[ext] || "application/octet-stream"

        // Return the file stream with appropriate headers
        return new NextResponse(fileStream as unknown as ReadableStream, {
            headers: {
                "Content-Type": contentType,
                "Content-Length": String(stats.size),
                "Cache-Control": contentType.startsWith("image/")
                    ? "public, max-age=31536000" // Cache images for 1 year
                    : "no-cache", // Don't cache other files
            },
        })
    } catch (error) {
        const err = error instanceof Error ? error.message : String(error)
        console.error("Error serving file:", {
            requestedPath: params.path,
            error: err,
            stack: error instanceof Error ? error.stack : undefined
        })
        return new NextResponse("Internal server error: " + err, { status: 500 })
    }
}
