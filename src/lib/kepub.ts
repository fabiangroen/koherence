import { exec } from "child_process"
import { promisify } from "util"
import { join } from "path"
import { exists } from "./file-utils"
import { getKepubifyPath } from "@/scripts/env"

// Ensure PATH is set up correctly
import "@/scripts/env"

const execAsync = promisify(exec)

interface ConversionResult {
    success: boolean
    kepubPath?: string
    error?: string
}

export async function convertToKepub(epubPath: string): Promise<ConversionResult> {
    try {
        // Check if kepubify is installed
        const kepubifyPath = getKepubifyPath()
        console.log("Looking for kepubify at:", kepubifyPath)

        try {
            await execAsync(`"${kepubifyPath}" --version`)
            console.log("✓ Found kepubify binary")
        } catch (error) {
            console.error("Error checking kepubify:", error)
            return {
                success: false,
                error: "kepubify is not installed. Please install it first: https://pgaskin.net/kepubify/",
            }
        }

        // Ensure source file exists
        if (!(await exists(epubPath))) {
            return {
                success: false,
                error: "Source epub file not found",
            }
        }

        // Generate output path
        const outputPath = epubPath.replace(/\.epub$/, ".kepub")

        // Run conversion
        console.log("Running kepubify conversion...")
        console.log("Command:", `"${kepubifyPath}" "${epubPath}" -o "${outputPath}"`)

        const { stdout, stderr } = await execAsync(`"${kepubifyPath}" "${epubPath}" -o "${outputPath}"`)
        if (stdout) console.log("Conversion output:", stdout)

        // Check if conversion was successful
        if (stderr) {
            return {
                success: false,
                error: stderr,
            }
        }

        // Verify output file exists
        if (!(await exists(outputPath))) {
            return {
                success: false,
                error: "Conversion failed: output file not created",
            }
        }

        return {
            success: true,
            kepubPath: outputPath,
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error during conversion",
        }
    }
}
