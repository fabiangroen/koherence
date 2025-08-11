"use client";

import React, { useState } from "react";
import type { Book } from "@/lib/types";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BookImage, Trash2 } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { deleteBook } from "../actions/delete-book";

interface ExtendedBook extends Book {
  language: string;
  publisher: string;
}

interface Props {
  books: ExtendedBook[];
}

export default function BooksTableClient({ books }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);

  const handleDelete = async (bookId: string) => {
    setIsDeleting(true);
    setBookToDelete(bookId);

    try {
      const result = await deleteBook(bookId);
      if (!result.success) {
        throw new Error(result.message || "Failed to delete book");
      }
      toast.success(result.message || "Book deleted successfully");
    } catch (error: unknown) {
      console.error("Error deleting book:", error);
      toast.error((error as Error).message || "Failed to delete book");
    } finally {
      setIsDeleting(false);
      setBookToDelete(null);
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Cover</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Release Date</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Publisher</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center pt-8">
                No books found
              </TableCell>
            </TableRow>
          ) : (
            books.map((book) => (
              <TableRow key={book.id}>
                <TableCell>
                  <div className="w-12 h-16 relative flex-shrink-0">
                    {book.coverImg && !book.coverImg.endsWith("none") ? (
                      <Image
                        src={book.coverImg}
                        alt={book.title}
                        fill
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center rounded">
                        <BookImage className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>{book.releaseDate}</TableCell>
                <TableCell>{book.language}</TableCell>
                <TableCell>{book.publisher}</TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        disabled={isDeleting && bookToDelete === book.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently
                          delete {book.title} from the database and storage.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="outline">
                            Cancel
                          </Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button
                            onClick={() => handleDelete(book.id)}
                            variant="destructive"
                            disabled={isDeleting}
                          >
                            {isDeleting && bookToDelete === book.id
                              ? "Deleting..."
                              : "Confirm Delete"}
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
