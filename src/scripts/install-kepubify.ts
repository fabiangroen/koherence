import { exec } from "child_process"
import { promisify } from "util"
import { platform } from "os"
import { mkdir, chmod } from "fs/promises"
import { getBinPath, getKepubifyPath } from "./env"
import { createWriteStream } from "fs"
import { pipeline } from "stream/promises"
import { Transform } from "stream"
import fetch from "node-fetch"
import { showProgress } from "./progress"

const execAsync = promisify(exec)

interface GithubRelease {
    tag_name: string
    assets: Array<{
        name: string
        browser_download_url: string
    }>
}

async function downloadFile(url: string, path: string) {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`)

    const total = parseInt(response.headers.get("content-length") || "0", 10)
    let current = 0

    process.stdout.write("\n")

    const writeStream = createWriteStream(path)
    const progress = new Transform({
        transform(chunk, _, callback) {
            current += chunk.length
            process.stdout.write(`\r${showProgress(current, total)}`)
            callback(null, chunk)
        },
        flush(callback) {
            process.stdout.write("\n")
            callback()
        }
    })

    await pipeline(response.body!, progress, writeStream)
}

export async function installKepubify() {
    try {
        // Check if kepubify is already installed
        const kepubifyPath = getKepubifyPath()
        try {
            const { stdout } = await execAsync(`"${kepubifyPath}" --version`)
            console.log("✓ Kepubify already installed at:", kepubifyPath)
            console.log("Version:", stdout.trim())
            return
        } catch {
            console.log("Installing kepubify...")
        }

        // Get latest release info from GitHub
        console.log("Fetching kepubify release info...")
        const response = await fetch(
            "https://api.github.com/repos/pgaskin/kepubify/releases/latest", {
            headers: {
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": "Koherence-Setup"
            }
        }
        )

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
        }
        const release = (await response.json()) as GithubRelease

        // Determine platform-specific binary name and URL
        const os = platform()
        const ext = os === "win32" ? ".exe" : ""
        let binaryName: string

        console.log("Platform info:")
        console.log("- OS:", os)
        console.log("- Architecture:", process.arch)
        console.log("- Node version:", process.version)

        // Handle macOS ARM64 specifically
        if (os === "darwin" && process.arch === "arm64") {
            console.log("Detected macOS ARM64, using special binary name")
            binaryName = "kepubify-darwin-arm64"
        } else {
            // For other platforms
            const osName = os === "darwin" ? "darwin" :
                os === "win32" ? "windows" :
                    "linux"
            const arch = process.arch === "x64" ? "64" :
                process.arch === "arm64" ? "arm64" :
                    "32"
            binaryName = `kepubify-${osName}-${arch}${ext}`
        }

        // Find the correct asset
        const asset = release.assets.find((a) => a.name === binaryName)
        if (!asset) {
            console.error("Available assets:", release.assets.map(a => a.name).join(", "))
            throw new Error(
                `No binary found for ${os} ${process.arch}.\n` +
                `Looking for: ${binaryName}\n` +
                `Available assets: ${release.assets.map(a => a.name).join(", ")}`
            )
        }

        // Create bin directory
        const binPath = getBinPath()
        await mkdir(binPath, { recursive: true })

        // Download the binary
        console.log(`Downloading kepubify from ${asset.browser_download_url}...`)
        console.log(`Installing to: ${kepubifyPath}`)

        try {
            await downloadFile(asset.browser_download_url, kepubifyPath)
            console.log("✓ Download completed")
        } catch (error) {
            console.error("Download failed:", error)
            throw new Error("Failed to download kepubify binary")
        }

        // Make it executable on Unix systems
        if (os !== "win32") {
            console.log("Setting executable permissions...")
            await chmod(kepubifyPath, 0o755)

            // Verify the binary works
            console.log("Verifying installation...")
            try {
                // Try without quotes first (Unix)
                try {
                    const { stdout } = await execAsync(`${kepubifyPath} --version`)
                    console.log("Installation verified:", stdout.trim())
                } catch (error) {
                    // Try with quotes (in case of spaces in path)
                    const { stdout } = await execAsync(`"${kepubifyPath}" --version`)
                    console.log("Installation verified:", stdout.trim())
                }
            } catch (error) {
                console.error("Verification failed:", error)
                throw new Error("Failed to verify kepubify installation")
            }
        }

        console.log("✓ Kepubify installed successfully")
        console.log("NOTE: You may need to restart your terminal to use kepubify")
    } catch (error) {
        console.error("Failed to install kepubify:")
        if (error instanceof Error) {
            console.error("Error:", error.message)
            console.error("Stack:", error.stack)
        } else {
            console.error("Unknown error:", error)
        }
        throw error
    }
}
