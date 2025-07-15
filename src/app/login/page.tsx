import { AuthButton } from "@/components/auth/auth-button"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function LoginPage() {
    const session = await getServerSession(authOptions)

    if (session?.user) {
        redirect("/")
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <div className="w-full max-w-sm space-y-4 rounded-lg border p-6 shadow-lg">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold">Welcome to Koherence</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Sign in to manage your Kobo library
                    </p>
                </div>
                <div className="flex justify-center space-y-4">
                    <AuthButton />
                </div>
            </div>
        </div>
    )
}
