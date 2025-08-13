"use client";

import React, { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import type { Book } from "@/lib/types";
import { BookCard } from "@/components/book/book-card";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Book as BookIcon } from "lucide-react";

interface Props {
  initialBooks: Book[];
}

export default function CardGridClient({ initialBooks }: Props) {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [openBookId, setOpenBookId] = useState<string | null>(null);

  useEffect(() => {
    setBooks(initialBooks);
  }, [initialBooks]);

  const fuse = useMemo(() => {
    return new Fuse(books, {
      keys: ["title", "author", "releaseDate"],
    });
  }, [books]);

  const results = useMemo(() => {
    if (!query) return books;
    return fuse.search(query).map((r) => r.item);
  }, [books, fuse, query]);

  return (
    <div className="w-full">
      {/* Search UI */}
      <Command className="transition-all">
        <CommandInput
          placeholder="Search books by title or author..."
          value={query}
          onValueChange={(value) => {
            setQuery(value);
            setShowSuggestions(value.length > 0);
          }}
        />

        <CommandList>
          <CommandGroup
            heading="Suggestions"
            className={
              showSuggestions && query.length > 0
                ? "transition-all duration-300 opacity-100 max-h-50"
                : "transition-all duration-300 opacity-0 max-h-0 overflow-hidden pointer-events-none"
            }
          >
            {results.slice(0, 5).map((book) => (
              <CommandItem
                key={book.id}
                onSelect={() => {
                  setQuery(book.title);
                  setShowSuggestions(false);
                  setOpenBookId(book.id);
                }}
              >
                <BookIcon />
                {book.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-6">
        {results.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            open={openBookId === book.id}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                // closing currently open dialog
                if (openBookId === book.id) setOpenBookId(null);
              } else {
                setOpenBookId(book.id);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
