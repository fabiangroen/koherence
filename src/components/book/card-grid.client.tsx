"use client";

import React, { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import type { Book } from "@/lib/types";
import { BookCard } from "@/components/book/book-card";
import {
  Command,
  CommandEmpty,
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
    <div className="w-full max-w-6xl">
      {/* Search UI */}
      <Command className="rounded-lg border shadow-md">
        <CommandInput
          placeholder="Search books by title or author..."
          value={query}
          onValueChange={(value) => {
            setQuery(value);
            setShowSuggestions(value.length > 0);
          }}
        />

        {showSuggestions && query.length > 0 && (
          <CommandList>
            {results.length > 0 ? (
              <CommandGroup heading="Suggestions">
                {results.slice(0, 5).map((book) => (
                  <CommandItem
                    key={book.id}
                    onSelect={() => {
                      setQuery(book.title);
                      setShowSuggestions(false);
                    }}
                  >
                    <BookIcon />
                    {book.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
          </CommandList>
        )}
      </Command>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-6">
        {results.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}
