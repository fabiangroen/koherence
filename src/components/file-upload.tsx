'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone';

export default function FileUpload() {
  const [files, setFiles] = useState<File[] | undefined>();

  const handleDrop = (files: File[]) => {
    //console.log(files);
    setFiles(files);
  };

  const handleSubmit = async () => {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    files.forEach((file) => formData.append('file', file));

    await toast.promise(
      fetch('/api/upload', {
        method: 'POST',
        body: formData,
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error('Upload failed');
        return data;
      }),
      {
        loading: 'Uploading files...',
        success: (data) => 'Files uploaded successfully',
        error: 'Upload failed',
      }
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="w-30 flex justify-end">
          <Button className="group flex justify-end w-10 hover:w-30 transition-all">
            <div className="opacity-0 group-hover:opacity-100 transition-all ease-in-out">Upload File</div>
            <Plus className="h-4 w-4 group-hover:-rotate-90 transition-all transition-500" />
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="overflow-hidden bg-card text-card-foreground rounded-xl border p-4">
        {/* File upload form or component can be added here */}
        <DialogTitle>Upload e-book</DialogTitle>
        <Dropzone
          accept={{
            'application/epub+zip': [],
            'application/octet-stream': ['.kepub'],
          }}
          maxFiles={10}
          onDrop={handleDrop}
          onError={() => toast.error('Invalid file type, please update .epub or .kepub files')}
          src={files}
        >
          <DropzoneEmptyState />
          <DropzoneContent />
        </Dropzone>
        <Button onClick={handleSubmit}>Submit</Button>
      </DialogContent>
    </Dialog>
  );
}
