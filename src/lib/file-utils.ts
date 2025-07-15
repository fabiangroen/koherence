import { mkdir, access } from "fs/promises"
import { join } from "path"
import { constants } from "fs"

export const UPLOAD_DIR = join(process.cwd(), "data", "uploads")
export const EPUB_DIR = join(UPLOAD_DIR, "epub")
export const KEPUB_DIR = join(UPLOAD_DIR, "kepub")
export const COVERS_PATH = "covers" // Path segment for cover images
export const COVERS_DIR = join(UPLOAD_DIR, COVERS_PATH)

export async function ensureDirectories() {
    try {
        await mkdir(UPLOAD_DIR, { recursive: true })
        await mkdir(EPUB_DIR, { recursive: true })
        await mkdir(KEPUB_DIR, { recursive: true })
        await mkdir(COVERS_DIR, { recursive: true })
    } catch (error) {
        console.error("Error creating directories:", error)
        throw error
    }
}

export function sanitizeFilename(filename: string): string {
    // Remove special characters and spaces
    return filename
        .replace(/[^a-zA-Z0-9.-]/g, "-")
        .replace(/\s+/g, "-")
        .toLowerCase()
}

export async function exists(path: string): Promise<boolean> {
    try {
        await access(path, constants.F_OK)
        return true
    } catch {
        return false
    }
}

export function createUniqueFilename(originalFilename: string, prefix?: string): string {
    const timestamp = Date.now()
    const sanitized = sanitizeFilename(originalFilename)
    const filename = `${timestamp}-${sanitized}`
    const finalPath = prefix ? join(prefix, filename) : filename
    console.log("Creating unique filename:", {
        original: originalFilename,
        sanitized,
        timestamp,
        prefix,
        final: finalPath
    })
    return finalPath
}

export function getFilePath(relativePath: string): string {
    const fullPath = join(UPLOAD_DIR, relativePath.replace(/\\/g, "/"))
    console.log("Resolving file path:", {
        relative: relativePath,
        full: fullPath,
        uploadDir: UPLOAD_DIR
    })
    return fullPath
}
