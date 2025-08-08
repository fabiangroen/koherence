"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { deleteAllBooks } from "../actions/delete-all-books";

export function DeleteBooksCard() {
  const handleDelete = async () => {
    try {
      const result = await deleteAllBooks();
      if (!result.success) {
        throw new Error(result.message || "Failed to delete books");
      }
      return result.message || "All books deleted successfully";
    } catch (error: unknown) {
      console.error("Error deleting books:", error);
      throw new Error((error as Error).message || "Failed to delete books");
    }
  };

  return (
    <Card className="flex">
      <CardHeader>
        <CardTitle>Delete All Books</CardTitle>
        <CardDescription>
          This will permanently delete all books from the database and storage.
        </CardDescription>
      </CardHeader>
      <div className="flex-1" />
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full" variant="destructive">
              Delete All Books
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete all
                books from the database and storage.
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
                  onClick={() =>
                    toast.promise(handleDelete(), {
                      loading: "Deleting all books...",
                      success: (message) => message,
                      error: (error) => error.message,
                    })
                  }
                  variant="destructive"
                >
                  Confirm Delete
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
