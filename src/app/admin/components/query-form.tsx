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
import { queryDB } from "../actions/query-db";

export function QueryForm() {
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const executeQuery = async () => {
    try {
      const response = await queryDB(query);

      if (!response.success) {
        throw new Error(response.message || "Failed to execute query");
      }

      return {
        message: "Query executed successfully",
        result: response.result,
      };
    } catch (error: unknown) {
      console.error("Error executing query:", error);
      throw new Error((error as Error).message || "Failed to execute query");
    }
  };

  // Helper function to render results as a table
  const renderResultsAsTable = (results: any) => {
    console.log("Results1:", results);
    if (!results || results.length === 0) {
      return <div className="text-muted-foreground">No results found</div>;
    }

    // Get column names from the first row
    const columns: string[] = results.columns;
    const rows = results.rows;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-muted">
              {columns.map((column) => (
                <th key={column} className="border p-2 text-left">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any, rowIndex: number) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? "bg-background" : "bg-muted/50"}
              >
                {columns.map((column, columnIndex) => (
                  <td key={`${rowIndex}-${columnIndex}`} className="border p-2">
                    {typeof row[columnIndex] === "object"
                      ? JSON.stringify(row[columnIndex])
                      : String(row[columnIndex])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
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
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isSubmitting && query.trim()) {
              // Defer dialog open to next tick to avoid focus trap issues
              setTimeout(() => setDialogOpen(true), 0);
            }
          }}
        />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Button
            className="w-full"
            type="button"
            disabled={isSubmitting || !query.trim()}
            onClick={() => setDialogOpen(true)}
          >
            {isSubmitting ? "Executing..." : "Run Query"}
          </Button>
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
                        setDialogOpen(false);
                        return (
                          <div>
                            <div className="font-semibold mb-2">
                              {data.message}
                            </div>
                            <pre className="bg-muted p-2 rounded-md whitespace-pre-wrap max-h-64 overflow-y-auto">
                              {renderResultsAsTable(data.result)}
                            </pre>
                          </div>
                        );
                      },
                      error: (error) => {
                        setIsSubmitting(false);
                        setDialogOpen(false);
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
