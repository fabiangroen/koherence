export class KepubifyError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "KepubifyError"
    }
}

export function handleKepubifyError(error: unknown): string {
    if (error instanceof Error) {
        const msg = error.message.toLowerCase()

        if (msg.includes("command not found") || msg.includes("is not recognized") || msg.includes("no such file")) {
            return "Kepubify not found. Please run:\n1. npm run setup:kepubify\n2. Restart your terminal\n3. Try again"
        }

        if (msg.includes("permission denied")) {
            return "Permission denied. Try:\n1. npm run setup:kepubify\n2. chmod +x ./bin/kepubify\n3. Try again"
        }

        if (msg.includes("invalid epub")) {
            return "Invalid EPUB file format. The file might be corrupted or not a valid epub"
        }

        if (msg.includes("no space")) {
            return "Not enough disk space to convert the book"
        }

        if (msg.includes("not a valid epub")) {
            return "The file is not a valid EPUB. Please ensure it's a proper epub file"
        }

        return `Conversion error: ${error.message}`
    }

    return "An unknown error occurred during conversion. Check the console for details"
}
