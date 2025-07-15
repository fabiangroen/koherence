"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Upload } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { StatusMessage } from "@/components/ui/status"

export function UploadDialog() {
    const [open, setOpen] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [status, setStatus] = useState<string>("")
    const [error, setError] = useState<string | null>(null)
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            "application/epub+zip": [".epub"]
        },
        maxFiles: 1,
        onDrop: async (acceptedFiles) => {
            if (acceptedFiles.length === 0) return
            setError(null)
            setUploading(true)
            setStatus("Uploading file...")

            const formData = new FormData()
            formData.append("file", acceptedFiles[0])

            try {
                setStatus("Uploading and processing...")
                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || "Upload failed")
                }

                const details = [
                    "✓ Upload successful!",
                    `Title: ${data.metadata.title}`,
                    data.metadata.author && `Author: ${data.metadata.author}`,
                    data.metadata.cover && "✓ Cover image extracted",
                    data.convertedTo && `✓ Converted to ${data.convertedTo} format`,
                    "\nYour book has been added to your library"
                ].filter(Boolean).join("\n")

                setStatus(details)

                // Dispatch event to refresh the book grid
                window.dispatchEvent(new CustomEvent("book-uploaded"))

                // Keep dialog open longer for success message
                setTimeout(() => {
                    setOpen(false)
                    setStatus("")
                }, 3500)
            } catch (error) {
                console.error("Upload error:", error)
                setError(error instanceof Error ? error.message : "Upload failed")
            } finally {
                setUploading(false)
            }
        },
    })

    return (
        <Dialog
            open={open}
            onOpenChange={(open) => {
                setOpen(open)
                if (!open) {
                    setError(null)
                    setStatus("")
                }
            }}
        >
            <DialogTrigger asChild>
                <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Book
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload epub book</DialogTitle>
                    <DialogDescription>
                        Upload an epub file to add it to your library. It will automatically be converted to kepub format.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-border"
                            } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        <input {...getInputProps()} disabled={uploading} />
                        {uploading ? (
                            <p>Uploading...</p>
                        ) : isDragActive ? (
                            <p>Drop the epub file here</p>
                        ) : (
                            <p>Drag and drop an epub file here, or click to select</p>
                        )}
                    </div>
                    {(error || status) && (
                        <StatusMessage
                            message={error || status}
                            loading={uploading}
                            error={!!error}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
