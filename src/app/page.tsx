"use client";

import { Input, Button } from "@/components/ui";
import { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "react-use";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { makeAutoObservable } from "mobx";

const MAX_RANDOM_WORDS = 5;

class Words {
  randomWords: Map<string, string> = new Map();
  pendingWords: Map<string, string> = new Map();
  constructor() {
    makeAutoObservable(this);
  }

  setRandomWords(words: [string, string][]) {
    this.pendingWords.clear();
    this.randomWords = new Map(words);
  }

  setPendingWord(word: string, value: string) {
    this.pendingWords.set(word, value);
  }

  get correct() {
    return Array.from(this.randomWords).every(([word]) => {
      const pendingValue = this.pendingWords.get(word);
      return pendingValue && pendingValue.toLowerCase() === word.toLowerCase();
    });
  }
}

const words = new Words();

const Home = observer(() => {
  const [allWords] = useLocalStorage<[string, string][]>("words");
  const [isClient, setIsClient] = useState(false);

  const getRandomWords = useCallback(() => {
    if (allWords && allWords.length > 0) {
      const shuffled = allWords.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, MAX_RANDOM_WORDS);
    }
    return [];
  }, [allWords]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    words.setRandomWords(getRandomWords());
  }, [getRandomWords]);

  const refreshWords = useCallback(() => {
    words.setRandomWords(getRandomWords());
  }, [getRandomWords]);

  return (
    <main className="flex flex-col space-y-2">
      <ul className="space-y-2">
        {isClient &&
          Array.from(words.randomWords).map(([word, translation]) => {
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
