import { PrismaClient } from "@prisma/client"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

async function dbSetup() {
    console.log("Setting up database...")

    try {
        // Run Prisma migrations
        console.log("Applying database schema...")
        await execAsync("npx prisma db push --accept-data-loss")
        console.log("✓ Database schema applied")

        // Generate Prisma client
        console.log("Generating Prisma client...")
        await execAsync("npx prisma generate")
        console.log("✓ Prisma client generated")

        // Verify database connection
        console.log("Verifying database connection...")
        const prisma = new PrismaClient()
        await prisma.$connect()
        await prisma.$disconnect()
        console.log("✓ Database connection verified")

        console.log("\nDatabase setup complete!")
    } catch (error) {
        console.error("Database setup failed:", error)
        process.exit(1)
    }
}

dbSetup()
