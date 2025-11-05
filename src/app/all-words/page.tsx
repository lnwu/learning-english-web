"use client";

import { useWords } from "@/hooks";
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";

// Subscribe function for client-side only rendering
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

const Home = () => {
  const { words, deleteWord } = useWords();
  const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const allWords = isClient ? words.allWords : new Map<string, string>();

  return (
    <main>
      <ul>
        {allWords.size > 0 ? (
          Array.from(allWords.entries()).map(([word, translation], index) => (
            <li key={index} className="flex items-center space-x-2">
              <button onClick={() => deleteWord(word)} title="Delete">
                🗑️
              </button>
              <strong>{word}</strong>: {translation}
            </li>
          ))
        ) : (
          <li>No words added yet.</li>
        )}
      </ul>
      <Link href="/add-word">
        <Button className="mt-4">Back to Add Word</Button>
      </Link>
    </main>
  );
};

export default Home;
