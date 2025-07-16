import { auth } from "@/auth"

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
        <main className="flex flex-1 justify-center">
            <p className="mt-8 text-muted-foreground">Welcome, {session.user.name}!</p>
        </main>
    )


}