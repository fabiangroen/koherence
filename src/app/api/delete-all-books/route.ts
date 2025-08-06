import { auth } from "@/auth";
import { db } from "@/db";
import { books as booksTable } from "@/db/schema";
import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Add authorization validation
  const session = await auth();
  const admin =
    process.env.ADMIN?.split(",").map((email) => email.trim()) || [];
  const isAdmin = admin.includes(session?.user?.email ?? "");

  if (!isAdmin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Delete all records from the database
    await db.delete(booksTable).run();

    // Recreate the storage directory for books
    const booksDir = path.join(process.cwd(), "storage", "books");
    await fs.rm(booksDir, { recursive: true, force: true });
    await fs.mkdir(booksDir, { recursive: true });

    return NextResponse.json({
      success: true,
      message: "All books deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Error deleting books:", error);
    return NextResponse.json(
      {
        success: false,
        message: (error as Error).message || "Failed to delete books",
      },
      { status: 500 },
    );
  }
}
