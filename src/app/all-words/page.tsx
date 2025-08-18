"use client";

import { useWords } from "@/hooks";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";

const Home = () => {
  const { words, deleteWord } = useWords();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedWords = localStorage.getItem("words");
    if (storedWords) {
      try {
        const parsedWords = JSON.parse(storedWords);
        words.setWords(parsedWords);
      } catch (error) {
        console.error("Error parsing stored words:", error);
      }
    }
  }, [words]);

  return (
    <main>
      <ul>
        {isClient && words.allWords.size > 0 ? (
          Array.from(words.allWords.entries()).map(([word, translation], index) => (
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
