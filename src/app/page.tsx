import { ThemeToggle } from "@/components/ui/themetoggle"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import Link from "next/link"

export default async function Home() {
  const session = await getServerSession(authOptions)
  const user = session?.user

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="min-h-screen flex flex-col">
      <div className="w-full flex items-center px-4 py-2 gap-4 bg-background border-b border-border">
        <div className="text-2xl font-satisfy">Koherence</div>
        <div className="flex-1"></div>
        <ThemeToggle />
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {user?.name}
          </div>
          <Avatar>
            <AvatarImage src={user?.image ?? ""} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="flex-1 container max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Your Library</h1>
          <Button>Upload Book</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Book grid will go here */}
          <div className="text-center text-muted-foreground">
            No books in your library yet
          </div>
        </div>
      </div>
    </div>
  )
}
