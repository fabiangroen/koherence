"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Book } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Trash2 } from "lucide-react"
import Image from "next/image"

interface BookCardProps {
    book: Book
    onSync?: (book: Book) => void
    onDelete?: (book: Book) => void
}

export function BookCard({ book, onSync, onDelete }: BookCardProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)
    const [retryCount, setRetryCount] = useState(0)
    const [isRetrying, setIsRetrying] = useState(false)

    const retryTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

    const handleRetry = useCallback(() => {
        if (retryCount >= 3 || isRetrying) return

        setIsRetrying(true)
        setRetryCount(c => c + 1)

        const img = document.querySelector(`#cover-${book.id}`) as HTMLImageElement
        if (img) {
            img.src = `${img.src}?retry=${Date.now()}`
        }

        // Clear any existing timeout
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current)
        }

        // Allow next retry after 1s
        retryTimeoutRef.current = setTimeout(() => {
            setIsRetrying(false)
        }, 1000)
    }, [book.id, retryCount, isRetrying])

    // Cleanup timeout on unmount or book change
    useEffect(() => {
        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current)
            }
            setRetryCount(0)
            setIsRetrying(false)
        }
    }, [book.id])

    const handleSync = async () => {
        if (!onSync) return
        setIsSyncing(true)
        try {
            await onSync(book)
        } finally {
            setIsSyncing(false)
        }
    }

    const handleDelete = async () => {
        if (!onDelete) return
        setIsDeleting(true)
        try {
            await onDelete(book)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Card className="overflow-hidden">
            <div
                className="aspect-[3/4] relative bg-muted group"
                role="figure"
                aria-label={`Book cover for ${book.title}`}
                onMouseEnter={() => {
                    // Clear error state when user hovers, allowing for a fresh start
                    if (retryCount >= 3) {
                        setRetryCount(0)
                        const loader = document.getElementById(`loader-${book.id}`)
                        if (loader) {
                            loader.querySelectorAll("[data-error]").forEach(el => {
                                el.setAttribute("data-error", "false")
                            })
                        }
                    }
                }}
            >
                {book.cover ? (
                    <>
                        <div
                            className="absolute inset-0 bg-muted/50 backdrop-blur-sm transition-all duration-500 opacity-100 data-[loaded=true]:opacity-0 data-[error=true]:bg-destructive/10 data-[retrying=true]:bg-background/50 flex items-center justify-center"
                            data-retrying={isRetrying}
                            data-loaded={false}
                            data-error={false}
                            id={`loader-${book.id}`}
                        >
                            <div className="flex flex-col items-center gap-2">
                                <div
                                    className="data-[error=false]:animate-spin data-[error=true]:hidden data-[retrying=true]:scale-150 transition-transform"
                                    data-error={false}
                                    data-retrying={isRetrying}
                                >
                                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                                <div className="text-sm text-destructive hidden data-[error=true]:block text-center" data-error={false}>
                                    Failed to load cover
                                    <button
                                        onClick={handleRetry}
                                        className="block mt-1 text-xs underline hover:text-destructive/80 opacity-100 data-[max-retries=true]:opacity-50 data-[retrying=true]:opacity-50"
                                        disabled={retryCount >= 3 || isRetrying}
                                        data-max-retries={retryCount >= 3}
                                        data-retrying={isRetrying}
                                    >
                                        {retryCount >= 3 ? (
                                            <span title={`Failed after ${retryCount} attempts`}>Too many retries</span>
                                        ) : isRetrying ? (
                                            <>Retrying...</>
                                        ) : (
                                            <>Try again ({3 - retryCount} attempts left)</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                className="bg-background/90 backdrop-blur-sm text-foreground p-2 rounded-full hover:bg-background data-[retrying=true]:animate-pulse data-[disabled=true]:opacity-50"
                                data-retrying={isRetrying}
                                data-disabled={retryCount >= 3}
                                aria-label="Refresh cover image"
                                onClick={e => {
                                    e.stopPropagation()
                                    if (!isRetrying && retryCount < 3) {
                                        handleRetry()
                                    }
                                }}
                                disabled={isRetrying || retryCount >= 3}
                                title="Refresh cover"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={isRetrying ? "animate-spin" : ""}
                                >
                                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                                </svg>
                            </button>
                        </div>
                        <Image
                            src={`/data/uploads/${book.cover}${retryCount ? `?retry=${Date.now()}` : ""}`}
                            id={`cover-${book.id}`}
                            alt={`Cover for ${book.title}`}
                            fill
                            sizes="300px"
                            className="object-cover transition-all duration-500 opacity-0 group-hover:brightness-75"
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRseHR8dHh0dHR0dHR0dHh0dHSElHR0dHR0dJR0dHR0dHR0dHR0dHR0dHR0dHR3/2wBDABUXFx4bHjklJTkdHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                            onLoad={e => {
                                try {
                                    e.currentTarget.classList.remove("opacity-0")
                                    const loader = document.getElementById(`loader-${book.id}`)
                                    if (loader) {
                                        loader.setAttribute("data-loaded", "true")
                                        loader.setAttribute("data-error", "false")
                                        loader.querySelectorAll("[data-error]").forEach(el => {
                                            el.setAttribute("data-error", "false")
                                        })
                                    }
                                    // Reset retry count on successful load
                                    if (retryCount > 0) {
                                        setRetryCount(0)
                                    }
                                } catch (err) {
                                    console.error("Failed to update load state:", {
                                        bookId: book.id,
                                        error: err instanceof Error ? err.message : String(err)
                                    })
                                }
                            }}
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                console.error("Failed to load cover:", {
                                    bookId: book.id,
                                    cover: book.cover,
                                    retryCount,
                                    url: `/data/uploads/${book.cover}${retryCount ? `?retry=${Date.now()}` : ""}`,
                                    error: (e.currentTarget as HTMLImageElement).src
                                })
                                const img = e.currentTarget
                                img.classList.add("opacity-0")
                                try {
                                    const loader = document.getElementById(`loader-${book.id}`)
                                    if (loader) {
                                        loader.setAttribute("data-loaded", "false")
                                        loader.setAttribute("data-error", "true")
                                        loader.setAttribute("data-retrying", "false")
                                        loader.querySelectorAll("[data-error]").forEach(el => {
                                            el.setAttribute("data-error", "true")
                                            el.setAttribute("data-retrying", "false")
                                        })
                                    }
                                    // Reset retrying state if error occurs during retry
                                    if (isRetrying) {
                                        setIsRetrying(false)
                                    }
                                } catch (err) {
                                    console.error("Failed to update error state:", {
                                        bookId: book.id,
                                        error: err instanceof Error ? err.message : String(err)
                                    })
                                }
                            }}
                            priority={true}
                        />
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground p-4 select-none">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="opacity-20"
                        >
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                        </svg>
                        <span className="text-sm">No cover</span>
                    </div>
                )}
            </div>
            <CardHeader className="space-y-1">
                <CardTitle className="line-clamp-1">{book.title}</CardTitle>
                {book.author && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                        {book.author}
                    </p>
                )}
            </CardHeader>
            <CardContent>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={handleSync}
                        disabled={isSyncing || isDeleting}
                    >
                        <Download className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                        {isSyncing ? "Syncing..." : "Sync"}
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive"
                        onClick={handleDelete}
                        disabled={isDeleting || isSyncing}
                    >
                        <Trash2 className={`h-4 w-4 ${isDeleting ? "animate-spin" : ""}`} />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
