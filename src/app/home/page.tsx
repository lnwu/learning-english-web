"use client";

import { Input, Button } from "@/components/ui";
import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useWords } from "@/hooks";

const Home = observer(() => {
  const { words } = useWords();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    words.setWords(words.getRandomWords());
  }, [words]);

  const refreshWords = () => {
    words.setWords(words.getRandomWords());
  };

  return (
    <main className="flex flex-col space-y-2">
      <ul className="space-y-2">
        {isClient &&
          Array.from(words.wordTranslations.entries()).map(([word, translation]) => {
            const inputValue = words.userInputs.get(word) || "";

            return (
              <li key={word} className="flex items-center space-x-2">
                <strong className="grow max-w-xs text-right">{translation}</strong>
                <Input className="w-xs" type="text" id={word} onChange={(e) => words.setUserInput(word, e.target.value.toLowerCase())} value={inputValue} />
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
