"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlert } from "lucide-react";

export function QueryForm() {
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const executeQuery = async () => {
    try {
      const response = await fetch("/api/db", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to execute query");
      }

      // Format the result for display
      const resultString = JSON.stringify(data.result, null, 2);
      return {
        message: "Query executed successfully",
        result: resultString,
      };
    } catch (error: unknown) {
      console.error("Error executing query:", error);
      throw new Error((error as Error).message || "Failed to execute query");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Query</CardTitle>
        <CardDescription>
          Run SQL queries directly on the database.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          name="query"
          placeholder="Enter SQL query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isSubmitting}
        />
        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="w-full"
              type="button"
              disabled={isSubmitting || !query.trim()}
            >
              {isSubmitting ? "Executing..." : "Run Query"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Execute SQL Query</DialogTitle>
              <DialogDescription className="space-y-2">
                This will execute the following SQL query directly on the
                database:
              </DialogDescription>
              <Input defaultValue={query} disabled={true} />
              <Alert variant="destructive">
                <CircleAlert />
                <AlertTitle>
                  Warning: This action can modify or delete data permanently.
                </AlertTitle>
                <AlertDescription>
                  Ensure you understand the consequences before proceeding.
                </AlertDescription>
              </Alert>
            </DialogHeader>
            <DialogFooter className="flex">
              <DialogClose asChild>
                <Button className="flex-1" type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setIsSubmitting(true);
                    toast.promise(executeQuery(), {
                      loading: "Executing query...",
                      success: (data) => {
                        setIsSubmitting(false);
                        return (
                          <div>
                            <div className="font-semibold mb-2">
                              {data.message}
                            </div>
                            <pre className="bg-muted p-2 rounded-md whitespace-pre-wrap max-h-64 overflow-y-auto">
                              {data.result}
                            </pre>
                          </div>
                        );
                      },
                      error: (error) => {
                        setIsSubmitting(false);
                        return error.message;
                      },
                    });
                  }}
                  disabled={isSubmitting}
                >
                  Confirm Execute
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
