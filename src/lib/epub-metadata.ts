import AdmZip from "adm-zip"
import { parseString } from "xml2js"
import { promisify } from "util"
import sharp from "sharp"
import { join } from "path"
import { writeFile } from "fs/promises"
import { COVERS_DIR, COVERS_PATH, createUniqueFilename, ensureDirectories } from "./file-utils"

const parseXmlAsync = promisify<string, unknown>(parseString)

interface ContainerXml {
    container: {
        rootfiles: [{
            rootfile: [{
                $: {
                    "full-path": string
                }
            }]
        }]
    }
}

interface OpfData {
    package: {
        $: { dir?: string }
        metadata: [{
            "dc:title": any[]
            "dc:creator"?: any[]
            "dc:language"?: any[]
            "dc:description"?: any[]
            "dc:publisher"?: any[]
            "dc:date"?: any[]
        }]
        manifest: [{
            item: Array<{
                $: {
                    id?: string
                    href?: string
                    "media-type"?: string
                }
            }>
        }]
    }
}

interface EpubMetadata {
    title: string
    author?: string
    cover?: string
    language?: string
    description?: string
    publisher?: string
    publishDate?: string
}

export async function extractEpubMetadata(epubPath: string): Promise<EpubMetadata> {
    try {
        await ensureDirectories() // Ensure all required directories exist

        const zip = new AdmZip(epubPath)
        const containerEntry = zip.getEntry("META-INF/container.xml")

        if (!containerEntry) {
            throw new Error("Invalid epub: missing container.xml")
        }

        // Parse container.xml to get OPF path
        const containerXml = containerEntry.getData().toString("utf8")
        const containerData = await parseXmlAsync(containerXml) as ContainerXml
        const opfPath = containerData.container.rootfiles[0].rootfile[0].$["full-path"]

        // Read and parse OPF file
        const opfEntry = zip.getEntry(opfPath)
        if (!opfEntry) {
            throw new Error("Invalid epub: missing OPF file")
        }

        const opfXml = opfEntry.getData().toString("utf8")
        const opfData = await parseXmlAsync(opfXml) as OpfData
        const metadata = opfData.package.metadata[0]

        // Extract cover image if available
        let coverPath: string | undefined
        try {
            const coverEntry = findCoverEntry(zip, opfData)
            if (coverEntry) {
                const imageData = coverEntry.getData()
                console.log("Found cover image, size:", imageData.length, "bytes")

                const filename = createUniqueFilename("cover.jpg", COVERS_PATH)
                const outputPath = join(COVERS_DIR, filename)
                console.log("Saving cover to:", outputPath)

                // Convert to JPEG and resize if needed
                await sharp(imageData)
                    .resize(800, 1200, {
                        fit: "inside",
                        withoutEnlargement: true
                    })
                    .jpeg({ quality: 85 })
                    .toFile(outputPath)

                // Store the complete relative path including covers directory
                coverPath = filename
                console.log("Cover saved as:", filename, "in:", COVERS_DIR)
            }
        } catch (error) {
            console.error("Error extracting cover:", error)
        }

        const extractedMetadata = {
            title: getFirstValue(metadata["dc:title"]) || "Unknown Title",
            author: getFirstValue(metadata["dc:creator"]),
            cover: coverPath?.replace(/\\/g, "/"), // Ensure forward slashes for storage
            language: getFirstValue(metadata["dc:language"]),
            description: getFirstValue(metadata["dc:description"]),
            publisher: getFirstValue(metadata["dc:publisher"]),
            publishDate: getFirstValue(metadata["dc:date"]),
        }

        console.log("Extracted metadata:", {
            ...extractedMetadata,
            description: extractedMetadata.description?.substring(0, 100) + "..."
        })

        return extractedMetadata
    } catch (error) {
        console.error("Error extracting metadata:", error)
        throw error
    }
}

function getFirstValue(array: any[] | undefined): string | undefined {
    if (!array || array.length === 0) return undefined
    const item = array[0]
    return typeof item === "string" ? item : item?._ || undefined
}

function findCoverEntry(zip: AdmZip, opfData: OpfData): AdmZip.IZipEntry | undefined {
    try {
        // Try to find cover image through manifest
        const manifest = opfData.package.manifest[0].item
        const coverItem = manifest.find((item: any) => {
            const id = (item.$?.id || "").toLowerCase()
            const href = item.$?.href || ""
            const type = item.$?.["media-type"] || ""
            return (
                (id.includes("cover") || href.toLowerCase().includes("cover")) &&
                type.startsWith("image/")
            )
        })

        if (coverItem?.$.href) {
            const opfDir = opfData.package.$?.dir || ""
            const coverPath = join(opfDir, coverItem.$.href).replace(/\\/g, "/")
            const entryPath = coverPath.replace(/\\/g, "/")
            console.log("Looking for cover at path:", entryPath)
            const entry = zip.getEntry(entryPath)
            return entry ?? undefined
        }

        // Fallback: look for common cover image paths
        const commonPaths = [
            "cover.jpg",
            "cover.jpeg",
            "cover.png",
            "images/cover.jpg",
            "images/cover.jpeg",
            "images/cover.png",
            "OEBPS/images/cover.jpg",
            "OEBPS/images/cover.jpeg",
            "OEBPS/images/cover.png"
        ]

        for (const path of commonPaths) {
            const entry = zip.getEntry(path)
            if (entry) {
                console.log("Found cover at common path:", path)
                return entry ?? undefined
            }
        }

        console.log("No cover image found")
        return undefined
    } catch (error) {
        console.error("Error finding cover:", error)
        return undefined
    }
}
