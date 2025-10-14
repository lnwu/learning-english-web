"use client";

import { Input, Button } from "@/components/ui";
import { useEffect, useState, useRef, type FormEvent } from "react";
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!words.correct) {
      return;
    }
    refreshWords();
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
      <main>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <ul className="space-y-2">
          {Array.from(words.wordTranslations.entries()).map(([word, translation]) => {
            const inputValue = words.userInputs.get(word) || "";
            const segments = translation.split("\n").filter(Boolean);
            let englishDefinition = "";
            let chineseTranslation = "";

            if (segments.length > 1) {
              [englishDefinition, chineseTranslation] = segments;
            } else if (segments.length === 1) {
              englishDefinition = segments[0];
            }

            const displayLines = chineseTranslation ? [chineseTranslation] : [];
            if (englishDefinition) {
              displayLines.push(englishDefinition);
            }
            const displayTranslation = displayLines.join("\n");

            return (
              <li key={word} className="flex items-center space-x-2">
                <div className="grow max-w-xs text-right relative">
                  <div className="flex items-center justify-end space-x-2">
                    <strong className="whitespace-pre-line">{displayTranslation}</strong>
                    <button type="button" onClick={() => pronounceWord(word)} className="text-blue-500 hover:text-blue-700 cursor-pointer text-sm" title={`Pronounce: ${word}`}>
                      🔊
                    </button>
                  </div>
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
                  tabIndex={inputValue === word ? -1 : 0} 
                  title={word}
                  className={`${inputValue === word ? '' : 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded'} px-1 relative group`}
                >
                  {inputValue === word ? "✅" : "❌"}
                  {inputValue !== word && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-focus:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      {word}
                    </div>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
          <div className="flex space-x-2 justify-end">
            <Button type="submit" disabled={!words.correct}>
              Refresh
            </Button>
            <Link href="/add-word">
              <Button type="button">Add New Word</Button>
            </Link>
          </div>
        </form>
      </main>
    )
  );
});

export default Home;
