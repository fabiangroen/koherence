"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";

export default function FileUpload() {
  const [files, setFiles] = useState<File[] | undefined>();

  const handleDrop = (files: File[]) => {
    //console.log(files);
    setFiles(files);
  };
  const router = useRouter();

  const handleSubmit = async () => {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    files.forEach((file) => formData.append("file", file));

    await toast.promise(
      fetch("/api/upload", {
        method: "POST",
        body: formData,
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          // Handle structured errors from API
          if (data.error) {
            throw new Error(data.message || "Upload failed");
          }
          throw new Error("Upload failed");
        }
        return data;
      }),
      {
        loading: "Uploading files...",
        success: () => {
          router.refresh();
          return "Files uploaded successfully";
        },
        error: (error) => {
          return error.message || "Upload failed";
        },
      },
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="w-30 flex justify-end">
          <Button className="group flex justify-end w-10 hover:w-30 transition-all">
            <div className="opacity-0 group-hover:opacity-100 transition-all">
              Upload File
            </div>
            <Plus className="h-4 w-4 group-hover:-rotate-90 transition-all transition-500" />
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="overflow-hidden bg-card text-card-foreground rounded-xl border p-4">
        {/* File upload form or component can be added here */}
        <DialogTitle>Upload e-book</DialogTitle>
        <Dropzone
          accept={{
            "application/epub+zip": [],
          }}
          maxFiles={10}
          onDrop={handleDrop}
          onError={() =>
            toast.error(
              "Invalid file type, please upload .epub or .kepub.epub files",
            )
          }
          src={files}
        >
          <DropzoneEmptyState />
          <DropzoneContent />
        </Dropzone>
        <DialogClose asChild>
          <Button
            onClick={handleSubmit}
            disabled={!files || files.length === 0}
          >
            Submit
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
