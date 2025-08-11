"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { books as booksTable, bookDeviceSync } from "@/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

/**
 * Server action to delete a specific book from the database and remove its files from storage.
 * Also handles deletion of related records in the bookDeviceSync table.
 */
export async function deleteBook(bookId: string) {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    return { success: false, message: "Unauthorized" };
  }

  try {
    // First, check if the book exists
    const book = await db
      .select()
      .from(booksTable)
      .where(eq(booksTable.id, bookId))
      .get();

    if (!book) {
      return { success: false, message: "Book not found" };
    }

    // Delete related records in bookDeviceSync table
    await db
      .delete(bookDeviceSync)
      .where(eq(bookDeviceSync.bookId, bookId))
      .run();

    // Delete the book record from the database
    await db.delete(booksTable).where(eq(booksTable.id, bookId)).run();

    // Remove the book's directory and files from the storage system
    const bookDir = path.join(process.cwd(), "storage", "books", bookId);
    try {
      await fs.rm(bookDir, { recursive: true, force: true });
    } catch (fileError) {
      // Log file system error but don't fail the entire operation
      // The book has been removed from the database, which is the primary concern
      console.warn(
        `Warning: Could not delete book directory ${bookDir}:`,
        fileError,
      );
    }

    // Revalidate admin page
    revalidatePath("/admin");

    return { success: true, message: "Book deleted successfully" };
  } catch (error) {
    console.error("Error deleting book (server action):", error);
    return {
      success: false,
      message: (error as Error).message || "Failed to delete book",
    };
  }
}
