"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

export function LogoutButton() {
    return (
        <Button
            variant="ghost"
            size="icon"
            title="Sign out"
            onClick={() => signOut({ callbackUrl: "/login" })}
        >
            <LogOut className="h-5 w-5" />
        </Button>
    )
}
