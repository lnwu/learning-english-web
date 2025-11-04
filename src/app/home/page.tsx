"use client";

import { Input, Button } from "@/components/ui";
import { useEffect, useState, useRef, type FormEvent } from "react";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useWords } from "@/hooks";
import { Header } from "@/components/header";

const Home = observer(() => {
  const { words } = useWords();
  const [isClient, setIsClient] = useState(false);
  const [shouldFocusFirst, setShouldFocusFirst] = useState(false);
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only set random words once words are loaded from API
    if (words.wordTranslations.size > 0 && !words.loading) {
      const currentWords = Array.from(words.wordTranslations.keys());
      const randomWords = words.getRandomWords();
      const randomWordKeys = randomWords.map(([word]) => word);

      // Only refresh if the current words are different
      if (
        currentWords.length !== randomWordKeys.length ||
        !currentWords.every((word, i) => word === randomWordKeys[i])
      ) {
        words.setWords(randomWords);
      }
    }
  }, [words, words.loading]);

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

  if (words.loading) {
    return (
      <div className="w-full">
        <Header />
        <main className="container mx-auto px-4">
          <p>Loading your vocabulary...</p>
        </main>
      </div>
    );
  }

  return (
    isClient && (
      <div className="w-full">
        <Header />
        <main className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-4">Practice Vocabulary</h1>
          {words.wordTranslations.size === 0 ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                You don&apos;t have any words yet. Start by adding some words to practice!
              </p>
              <Link href="/add-word">
                <Button>Add Your First Word</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
              <ul className="space-y-2">
                {Array.from(words.wordTranslations.entries()).map(
                  ([word, translation]) => {
                    const inputValue = words.userInputs.get(word) || "";
                    const segments = translation.split("\n").filter(Boolean);
                    let englishDefinition = "";
                    let chineseTranslation = "";

                    if (segments.length > 1) {
                      [englishDefinition, chineseTranslation] = segments;
                    } else if (segments.length === 1) {
                      englishDefinition = segments[0];
                    }

                    const displayLines = chineseTranslation
                      ? [chineseTranslation]
                      : [];
                    if (englishDefinition) {
                      displayLines.push(englishDefinition);
                    }
                    const displayTranslation = displayLines.join("\n");

                    return (
                      <li key={word} className="flex items-center space-x-2">
                        <div className="grow max-w-xs text-right relative">
                          <strong className="whitespace-pre-line">
                            {displayTranslation}
                          </strong>
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
                          onChange={(e) =>
                            words.setUserInput(word, e.target.value.toLowerCase())
                          }
                          value={inputValue}
                        />
                        <span
                          tabIndex={inputValue === word ? -1 : 0}
                          title={word}
                          className={`${
                            inputValue === word
                              ? ""
                              : "cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded"
                          } px-1 relative group`}
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
                  }
                )}
              </ul>
              <div className="flex space-x-2 justify-end">
                <Button type="submit" disabled={!words.correct}>
                  Refresh
                </Button>
                <Link href="/add-word">
                  <Button type="button" variant="outline">
                    Add New Word
                  </Button>
                </Link>
                <Link href="/all-words">
                  <Button type="button" variant="outline">
                    View All
                  </Button>
                </Link>
              </div>
            </form>
          )}
        </main>
      </div>
    )
  );
});

export default Home;
