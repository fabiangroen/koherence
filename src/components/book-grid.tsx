"use client"

import { useEffect, useState, useCallback } from "react"
import { BookCard } from "./book-card"
import { Book } from "@/lib/types"
import { deleteBook, getUserBooks, syncBook } from "@/lib/book-actions"

interface BookGridProps {
    userId: string
}

export function BookGrid({ userId }: BookGridProps) {
    const [books, setBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)

    // Listen for file uploads to refresh the grid
    useEffect(() => {
        function handleFileUpload() {
            setRefreshKey(key => key + 1)
        }
        window.addEventListener("book-uploaded", handleFileUpload)
        return () => window.removeEventListener("book-uploaded", handleFileUpload)
    }, [])

    const loadBooks = useCallback(async () => {
        try {
            const userBooks = await getUserBooks(userId)
            setBooks(userBooks)
        } catch (error) {
            console.error("Error loading books:", error)
        } finally {
            setLoading(false)
        }
    }, [userId, refreshKey])

    useEffect(() => {
        loadBooks()
    }, [loadBooks])

    const handleSync = async (book: Book) => {
        try {
            await syncBook(book.id, userId)
            await loadBooks()
        } catch (error) {
            console.error("Error syncing book:", error)
        }
    }

    const handleDelete = async (book: Book) => {
        try {
            await deleteBook(book.id, userId)
            await loadBooks()
        } catch (error) {
            console.error("Error deleting book:", error)
        }
    }

    if (loading) {
        return (
            <div className="text-center text-muted-foreground">
                Loading your library...
            </div>
        )
    }

    if (books.length === 0) {
        return (
            <div className="text-center text-muted-foreground">
                No books in your library yet
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
                <BookCard
                    key={book.id}
                    book={book}
                    onSync={handleSync}
                    onDelete={handleDelete}
                />
            ))}
        </div>
    )
}
