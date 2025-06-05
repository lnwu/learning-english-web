"use client";

import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useLocalStorage } from "react-use";
import { observer, useLocalObservable } from "mobx-react-lite";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Home = observer(() => {
  const [allWords] = useLocalStorage<[string, string][]>("words");
  const [randomWords, setRandomWords] = useState<[string, string][]>([]);
  const [isClient, setIsClient] = useState(false);

  const inputWords = useLocalObservable(() => ({
    words: new Map<string, string>(),
    set(key: string, value: string) {
      this.words.set(key, value);
    },
  }));

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (allWords && allWords.length > 0) {
      const shuffled = allWords.sort(() => 0.5 - Math.random());
      setRandomWords(shuffled.slice(0, 5));
    }
  }, [allWords]);

  const refreshWords = () => {
    if (allWords && allWords.length > 0) {
      const shuffled = allWords.sort(() => 0.5 - Math.random());
      setRandomWords(shuffled.slice(0, 5));
      inputWords.words.clear();
    }
  };

  return (
    <main className="flex flex-col space-y-2">
      <ul className="space-y-2">
        {isClient &&
          randomWords.map(([word, translation]) => {
            const inputValue = inputWords.words.get(word) || "";

            return (
              <li key={word} className="flex items-center space-x-2">
                <strong className="w-xs text-right">{translation}:</strong>
                <Input type="text" id={word} onChange={(e) => inputWords.set(word, e.target.value.toLowerCase())} value={inputValue} />
                <span>{inputValue === word ? "✅" : "❌"}</span>
              </li>
            );
          })}
      </ul>
      <div className="flex space-x-2 justify-end">
        <Button onClick={refreshWords}>Refresh</Button>
        <Link href="/add-word">
          <Button type="button">Add New Word</Button>
        </Link>
      </div>
    </main>
  );
});

export default Home;
