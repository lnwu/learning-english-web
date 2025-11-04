"use client";

import { useWords } from "@/hooks";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { Header } from "@/components/header";
import { observer } from "mobx-react-lite";

const AllWords = observer(() => {
  const { words, deleteWord } = useWords();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (word: string) => {
    setDeleting(word);
    try {
      await deleteWord(word);
    } catch (error) {
      console.error("Failed to delete word:", error);
      alert("Failed to delete word. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="w-full">
      <Header />
      <main className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">All Words</h1>
        {words.loading ? (
          <p>Loading words...</p>
        ) : (
          <>
            <ul className="space-y-2 mb-4">
              {words.allWords.size > 0 ? (
                Array.from(words.allWords.entries()).map(([word, translation]) => (
                  <li key={word} className="flex items-center space-x-2 p-2 border rounded">
                    <button
                      onClick={() => handleDelete(word)}
                      title="Delete"
                      disabled={deleting === word}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      {deleting === word ? "⏳" : "🗑️"}
                    </button>
                    <div>
                      <strong className="text-lg">{word}</strong>
                      <p className="text-sm text-gray-600 whitespace-pre-line">{translation}</p>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No words added yet.</li>
              )}
            </ul>
            <div className="flex gap-2">
              <Link href="/add-word">
                <Button>Add New Word</Button>
              </Link>
              <Link href="/home">
                <Button variant="outline">Practice</Button>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
});

export default AllWords;
