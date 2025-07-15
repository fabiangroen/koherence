"use server"

import { prisma } from "./prisma"
import { revalidatePath } from "next/cache"

export async function getUserBooks(userId: string) {
    try {
        const books = await prisma.book.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: "desc"
            },
            include: {
                uploadedBy: true,
                syncedByUsers: true
            }
        })
        return books
    } catch (error) {
        console.error("Error fetching books:", error)
        throw error
    }
}

export async function deleteBook(bookId: string, userId: string) {
    try {
        await prisma.book.delete({
            where: {
                id: bookId,
                userId: userId // Ensure user owns the book
            }
        })
        revalidatePath("/")
    } catch (error) {
        console.error("Error deleting book:", error)
        throw error
    }
}

export async function syncBook(bookId: string, userId: string) {
    try {
        const book = await prisma.book.update({
            where: {
                id: bookId
            },
            data: {
                syncedByUsers: {
                    connect: {
                        id: userId
                    }
                }
            }
        })
        revalidatePath("/")
        return book
    } catch (error) {
        console.error("Error syncing book:", error)
        throw error
    }
}
