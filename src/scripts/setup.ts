import { ensureDirectories } from "../lib/file-utils"
import { PrismaClient } from "@prisma/client"
import { randomBytes } from "crypto"
import { writeFile } from "fs/promises"
import { join } from "path"
import { installKepubify } from "./install-kepubify"
import { getBinPath, getPATH } from "./env"

// Import env to set up PATH
import "./env"

async function setup() {
    console.log("Setting up Koherence environment...")

    try {
        // Generate .env if it doesn't exist
        console.log("Checking .env file...")
        try {
            const envPath = join(process.cwd(), ".env")
            const envContent = `# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${randomBytes(32).toString("base64")}
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DATABASE_URL="file:./prisma/dev.db"

# Binary Path (do not modify)
KEPUBIFY_PATH="${getBinPath()}"
PATH="${getBinPath()}:$PATH"
`
            await writeFile(envPath, envContent)
            console.log("✓ Created .env file with secure NEXTAUTH_SECRET")
        } catch (error) {
            console.log("× .env file already exists, skipping")
        }

        // Create required directories
        console.log("Setting up environment...")
        await ensureDirectories()

        // Update PATH to include our bin directory
        process.env.PATH = getPATH()
        console.log("✓ Environment configured")

        // Install kepubify
        console.log("Setting up kepubify...")
        await installKepubify()

        // Initialize database
        console.log("Setting up database...")
        const { execFile } = await import("child_process")
        const { promisify } = await import("util")
        const execFileAsync = promisify(execFile)

        await execFileAsync("npx", ["tsx", "src/scripts/db-setup.ts"])

        console.log("\nSetup complete! Make sure to:")
        console.log("1. Configure Google OAuth credentials in .env")
        console.log("2. Restart your terminal to use kepubify")
        console.log("3. Start the application with: npm run dev")
    } catch (error) {
        console.error("Error during setup:", error)
        process.exit(1)
    }
}

setup()
