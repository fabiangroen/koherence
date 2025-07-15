import { join } from "path"

export function getBinPath() {
    return join(process.cwd(), "bin")
}

export function getKepubifyPath() {
    // First try to get from environment variable
    if (process.env.KEPUBIFY_PATH) {
        return join(process.env.KEPUBIFY_PATH, process.platform === "win32" ? "kepubify.exe" : "kepubify")
    }

    // Fallback to default location
    const binPath = getBinPath()
    const ext = process.platform === "win32" ? ".exe" : ""
    const path = join(binPath, `kepubify${ext}`)

    console.log("Using kepubify at:", path)
    return path
}

export function getPATH() {
    const binPath = getBinPath()
    const currentPath = process.env.PATH || ""

    // Ensure bin directory is in PATH
    if (!currentPath.includes(binPath)) {
        return `${binPath}${process.platform === "win32" ? ";" : ":"}${currentPath}`
    }

    return currentPath
}

// Update process.env.PATH to include our bin directory
process.env.PATH = getPATH()
