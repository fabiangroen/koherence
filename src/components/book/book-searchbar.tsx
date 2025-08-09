"use client"
import { makeSearchableCollection } from "@/lib/clientSearchUtils";
import { Book, bookCollection } from "@/lib/types";
import { SearchOptions } from "minisearch";
import { useState } from "react";

interface SearchBarProps {
  books: Book[];
  searchOptions?: SearchOptions;
}

export default function SearchBar({
  books,
  searchOptions,
}: SearchBarProps) {
  let [query, setQuery] = useState("");

  const handleSearch = (value: string) => {
    setQuery(value)
    const results = makeSearchableCollection(books).search(value, searchOptions);
    const newBooks = results.collect();
    console.log("search result: ",newBooks)
  };

  return (
    <div className="w-full max-w-md mx-auto p-2">
      <input
        type="text"
        placeholder="Search books..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}