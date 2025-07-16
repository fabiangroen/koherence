import { Button } from "@/components/ui/button"
import { signIn } from "@/auth"
import { auth } from "@/auth"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default async function SignIn() {
    const session = await auth()

    if (!session?.user) return (
        <form
            action={async () => {
                "use server"
                await signIn("google")
            }}
        >
            <Button type="submit">Sign in</Button>
        </form>
    )
    return (
        <Avatar>
            <AvatarImage src={session.user.image ?? undefined} />
            <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
        </Avatar>
    )
} 