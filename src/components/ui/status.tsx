import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusMessageProps {
    message: string
    loading?: boolean
    error?: boolean
    className?: string
}

export function StatusMessage({ message, loading, error, className }: StatusMessageProps) {
    return (
        <div className={cn(
            "text-sm text-center whitespace-pre-line",
            error ? "text-destructive" : "text-muted-foreground",
            className
        )}>
            {loading && (
                <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" />
            )}
            {message.split("\n").map((line, i) => (
                <div key={i} className="leading-relaxed">
                    {line}
                </div>
            ))}
        </div>
    )
}
