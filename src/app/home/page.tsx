"use client";

import { Input, Button } from "@/components/ui";
import { useEffect, useState, useRef } from "react";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useWords } from "@/hooks";

const Home = observer(() => {
  const { words } = useWords();
  const [isClient, setIsClient] = useState(false);
  const [shouldFocusFirst, setShouldFocusFirst] = useState(false);
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    words.setWords(words.getRandomWords());
  }, [words]);

  useEffect(() => {
    if (shouldFocusFirst && words.wordTranslations.size > 0) {
      const firstWord = Array.from(words.wordTranslations.keys())[0];
      if (firstWord) {
        const firstInput = inputRefs.current.get(firstWord);
        if (firstInput) {
          firstInput.focus();
          setShouldFocusFirst(false);
        }
      }
    }
  }, [shouldFocusFirst, words.wordTranslations]);

  const refreshWords = () => {
    words.userInputs.clear();
    words.setWords(words.getRandomWords());
    setShouldFocusFirst(true);
  };

  const pronounceWord = (word: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    isClient && (
      <main className="flex flex-col space-y-2">
        <ul className="space-y-2">
          {Array.from(words.wordTranslations.entries()).map(([word, translation]) => {
            const inputValue = words.userInputs.get(word) || "";
            const [englishDefinition, chineseTranslation] = translation.includes("\n") ? translation.split("\n") : [translation, ""];

            return (
              <li key={word} className="flex items-center space-x-2">
                <div className="grow max-w-xs text-right relative group">
                  <div className="flex items-center justify-end space-x-2">
                    <strong className="cursor-help">{englishDefinition}</strong>
                    <button onClick={() => pronounceWord(word)} className="text-blue-500 hover:text-blue-700 cursor-pointer text-sm" title={`Pronounce: ${word}`}>
                      🔊
                    </button>
                  </div>
                  {chineseTranslation && <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">{chineseTranslation}</div>}
                </div>
                <Input 
                  className="w-xs" 
                  type="text" 
                  id={word} 
                  ref={(el) => {
                    if (el) {
                      inputRefs.current.set(word, el);
                    }
                  }}
                  onChange={(e) => words.setUserInput(word, e.target.value.toLowerCase())} 
                  value={inputValue} 
                />
                <span 
                  tabIndex={0} 
                  title={word}
                  className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded px-1 relative group"
                >
                  {inputValue === word ? "✅" : "❌"}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-focus:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    {word}
                  </div>
                </span>
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
    )
  );
});

export default Home;
