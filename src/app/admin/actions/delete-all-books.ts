"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { books as booksTable } from "@/db/schema";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

/**
 * Server action to delete all books from the database and clear the storage/books directory.
 * Mirrors the logic previously exposed via POST /api/db/delete-all-books.
 */
export async function deleteAllBooks() {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    return { success: false, message: "Unauthorized" };
  }

  try {
    // Delete all records from the database
    await db.delete(booksTable).run();

    // Recreate the storage directory for books
    const booksDir = path.join(process.cwd(), "storage", "books");
    await fs.rm(booksDir, { recursive: true, force: true });
    await fs.mkdir(booksDir, { recursive: true });

    // Revalidate admin page (adjust path if needed)
    revalidatePath("/admin");

    return { success: true, message: "All books deleted successfully" };
  } catch (error) {
    console.error("Error deleting books (server action):", error);
    return {
      success: false,
      message: (error as Error).message || "Failed to delete books",
    };
  }
}
