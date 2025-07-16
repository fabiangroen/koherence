import { auth } from "@/auth"
import {Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";

type Book = {
  author: string;
  title: string;
  releaseYear: number;
  coverImg: string; // currently stored as a path to an image, with as root the public/covers/ directory
};

// Dummy test array
// In order to test stuff we store a few images in the public/covers/ directory to display
const books: Book[] = [
  {
    author: "Harold Bloom",
    title: "The anxiety of influence",
    releaseYear: 1973,
    coverImg: "/TheAnxietyOfInfluence.jpg",
  },
  {
    author: "Frank Herbert",
    title: "Dune",
    releaseYear: 1965,
    coverImg: "Dune1.jpg",
  },
    {
    author: "Frank Herbert",
    title: "Dune Messiah",
    releaseYear: 1969,
    coverImg: "Dune2.jpg",
  },  
  {
    author: "Frank Herbert",
    title: "Children of Dune",
    releaseYear: 1976,
    coverImg: "Dune3.jpg",
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
            <Card key={index} className="w-full h-full flex flex-col p-0">  {/* for the other look it was px-4 py-2*/}
                <CardHeader className="flex-1 flex flex-col items-center p-0"> {/* and here p-2 */}
                <img
                    src={"covers/".concat(book.coverImg)}
                    alt={book.title}
                    className="w-full h-full object-cover rounded"
                />
                <CardTitle className="text-base text-center">{book.title}</CardTitle>
                <CardDescription className="text-xs text-center -mt-1 mb-2 text-muted-foreground"> {/* These margins were also different for the other look */}
                    {book.author} &middot; {book.releaseYear}
                </CardDescription>
                </CardHeader>
            </Card>
            ))}
        </div>
        </main>
    );
}