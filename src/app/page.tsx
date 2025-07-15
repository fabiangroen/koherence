import { ThemeToggle } from "@/components/ui/themetoggle"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { UploadDialog } from "@/components/upload-dialog"
import { LogoutButton } from "@/components/logout-button"
import { BookGrid } from "@/components/book-grid"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const user = session.user

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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {user?.name}
            </div>
            <Avatar>
              <AvatarImage src={user?.image ?? ""} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>
          <LogoutButton />
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 container max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Your Library</h1>
          <UploadDialog />
        </div>

        <BookGrid userId={session.user.id} />
      </div>
    </div>
  )
}
