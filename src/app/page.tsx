"use client";

import { useState, FormEvent } from "react";

export default function Home() {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<string | null>(null);

  const handleQuerySubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const response = await fetch("/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data: { results: string } = await response.json();
    setResults(data.results || "No results found.");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <form
        onSubmit={handleQuerySubmit}
        className="flex flex-col gap-4 w-full max-w-md"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query"
          className="border border-gray-300 rounded px-4 py-2 w-full"
        />
        <button
          type="submit"
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
        >
          Submit Query
        </button>
      </form>
      {results && (
        <div className="mt-4 p-4 border border-gray-300 rounded w-full max-w-md">
          <h2 className="font-bold mb-2">Query Results:</h2>
          <p>{results}</p>
        </div>
      )}
    </div>
  );
}
