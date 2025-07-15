"use client"

import { Button } from "@/components/ui/button"
import { signIn, signOut, useSession } from "next-auth/react"

export function AuthButton() {
    const { data: session } = useSession()

    if (session?.user) {
        return (
            <Button
                onClick={() => signOut()}
            >
                Sign Out
            </Button>
        )
    }

    return (
        <Button
            onClick={() => signIn("google")}
        >
            Sign In with Google
        </Button>
    )
}
