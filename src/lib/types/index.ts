export interface Book {
    id: string
    title: string
    author?: string | null
    cover?: string | null
    uploadedBy: User
    userId: string
    syncedByUsers: User[]
    filePath: string
    originalPath: string
    createdAt: Date
    metadata?: string | null
}

export interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    books: Book[]
    syncedBooks: Book[]
}
