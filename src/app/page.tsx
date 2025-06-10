"use client";

import { Input, Button } from "@/components/ui";
import { useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useWords } from "@/hooks";

const MAX_RANDOM_WORDS = 5;

const Home = observer(() => {
  const { words } = useWords();
  const [isClient, setIsClient] = useState(false);

  const getRandomWords = useCallback(() => {
    const allWords = words.allWords;
    if (allWords.length > 0) {
      const shuffled = [...allWords].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, MAX_RANDOM_WORDS);
    }
    return [];
  }, [words]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    words.setWords(getRandomWords());
  }, [getRandomWords, words]);

  const refreshWords = useCallback(() => {
    words.setWords(getRandomWords());
  }, [getRandomWords, words]);

  return (
    <main className="flex flex-col space-y-2">
      <ul className="space-y-2">
        {isClient &&
          Array.from(words.randomWords.entries()).map(([word, translation]) => {
            const inputValue = words.pendingWords.get(word) || "";

            return (
              <li key={word} className="flex items-center space-x-2">
                <strong className="w-xs text-right">{translation}:</strong>
                <Input type="text" id={word} onChange={(e) => words.setPendingWord(word, e.target.value.toLowerCase())} value={inputValue} />
                <span title={word}>{inputValue === word ? "✅" : "❌"}</span>
              </li>
            );
          })}
      </ul>
      <div className="flex space-x-2 justify-end">
        <Button onClick={refreshWords} disabled={!words.correct}>
          Refresh
        </Button>
        <Link href="/add-word">
          <Button type="button">Add New Word</Button>
        </Link>
      </div>
    </main>
  );
});

export default Home;
