import { auth } from "@/auth"
import { BookCard } from "@/components/book-card";
import { BookMorphingDialog, BookMorphingDialogTrigger, BookMorphingDialogContent, BookMorphingDialogContainer, BookMorphingDialogClose } from "@/components/book-morphing-dialog"
import BookDrawer from "@/components/book-drawer"
import type { Book } from "@/lib/types";


const books: Book[] = [
    {
        author: "Frank Herbert",
        title: "Dune",
        releaseYear: 1965,
        coverImg: "/covers/Dune1.jpg",
    },
];

export default async function CardGrid() {
    const session = await auth()

    if (!session?.user) return (
        <main className="flex flex-1 justify-center">
            <p className="mt-8 text-muted-foreground">Log in to view books</p>
        </main>
    )

    const whitelist = process.env.WHITELIST?.split(",").map(email => email.trim()) || []

    if (!(whitelist.includes(session?.user.email ?? ""))) return (
        <main className="flex flex-1 justify-center">
            <p className="mt-8 text-muted-foreground">You are not allowed to view this content</p>
        </main>
    )

    return (
        <main className="flex flex-1 flex-col items-center">
            <p className="mt-8 text-muted-foreground mb-6">
                Welcome, {session.user.name}!
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-6 w-full max-w-6xl">
                {books.map((book, index) => (
                    <BookMorphingDialog key={index} book={book}>
                        <BookMorphingDialogTrigger>
                            <BookCard />
                        </BookMorphingDialogTrigger>
                        <BookMorphingDialogContainer>
                            <BookMorphingDialogContent>
                                <BookDrawer />
                                <BookMorphingDialogClose className="opacity-0" />
                            </BookMorphingDialogContent>
                        </BookMorphingDialogContainer>
                    </BookMorphingDialog>
                ))}
            </div>
        </main>
    );
}
