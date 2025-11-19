"use client";

import { Input, Button, FrequencyBar, SyncIndicator } from "@/components/ui";
import { useEffect, useState, useRef, type FormEvent } from "react";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useFirestoreWords } from "@/hooks";

const Home = observer(() => {
  const { words, updateWordFrequency, saveInputTime, syncToFirestore, syncing, pendingCount, loading, error } = useFirestoreWords();
  const [isClient, setIsClient] = useState(false);
  const [shouldFocusFirst, setShouldFocusFirst] = useState(false);
  const [randomWords, setRandomWords] = useState<[string, string][]>([]);
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const hintRevealedRef = useRef<Set<string>>(new Set()); // Track which hints were revealed
  const timerStartRef = useRef<Map<string, number>>(new Map()); // Track start time for each word

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize random words when words are loaded
  useEffect(() => {
    if (!loading && words.allWords.size > 0 && randomWords.length === 0) {
      setRandomWords(words.getRandomWords());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, words.allWords.size, randomWords.length]);

  useEffect(() => {
    if (shouldFocusFirst && randomWords.length > 0) {
      const firstWord = randomWords[0][0];
      if (firstWord) {
        const firstInput = inputRefs.current.get(firstWord);
        if (firstInput) {
          firstInput.focus();
          setShouldFocusFirst(false);
        }
      }
    }
  }, [shouldFocusFirst, randomWords]);

  const refreshWords = () => {
    words.userInputs.clear();
    hintRevealedRef.current.clear();
    timerStartRef.current.clear();
    setRandomWords(words.getRandomWords());
    setShouldFocusFirst(true);
  };

  const isCorrect = () => {
    // Check if all currently displayed words have been filled in correctly
    return (
      randomWords.length > 0 &&
      randomWords.every(([word]) => words.userInputs.get(word) === word)
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isCorrect()) {
      return;
    }

    // Process all correct answers with time-based frequency adjustment
    const updatePromises = randomWords.map(async ([word]) => {
      const inputValue = words.userInputs.get(word);
      if (inputValue === word) {
        const startTime = timerStartRef.current.get(word);
        
        if (startTime) {
          // Calculate input time in seconds
          const endTime = Date.now();
          const inputTimeSeconds = (endTime - startTime) / 1000;
          
          // Save input time to localStorage and sync in background
          await saveInputTime(word, inputTimeSeconds);
          
          // Calculate frequency delta based on input speed vs length category average
          const delta = words.calculateFrequencyDelta(word, inputTimeSeconds);
          await updateWordFrequency(word, delta);
        } else {
          // No timer data: use neutral frequency increase
          await updateWordFrequency(word, 1);
        }
      }
      return Promise.resolve();
    });

    try {
      await Promise.all(updatePromises);
    } catch (err) {
      console.error("Failed to update frequencies:", err);
    }

    refreshWords();
  };

  const handleHintReveal = async (word: string) => {
    // Only decrement frequency once per word per session
    if (!hintRevealedRef.current.has(word)) {
      hintRevealedRef.current.add(word);
      try {
        await updateWordFrequency(word, -1);
      } catch (err) {
        console.error("Failed to update frequency on hint reveal:", err);
      }
    }
  };

  if (loading) {
    return (
      <main>
        <div className="text-center">Loading your words...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <div className="text-center text-red-500">Error: {error}</div>
        <div className="text-center mt-4">
          <Link href="/add-word">
            <Button>Add New Word</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    isClient && (
      <>
        <SyncIndicator 
          syncing={syncing} 
          pendingCount={pendingCount}
          onManualSync={syncToFirestore}
        />
        <main>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <ul className="space-y-2">
          {randomWords.map(([word, translation]) => {
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
                  <strong className="whitespace-pre-line">{displayTranslation}</strong>
                </div>
                <div className="flex items-center space-x-2">
                  <Input 
                    className="w-xs" 
                    type="text" 
                    id={word} 
                    ref={(el) => {
                      if (el) {
                        inputRefs.current.set(word, el);
                      }
                    }}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase();
                      
                      // Start timer on first character typed
                      if (value.length === 1 && !timerStartRef.current.has(word)) {
                        timerStartRef.current.set(word, Date.now());
                      }
                      
                      words.setUserInput(word, value);
                    }} 
                    value={inputValue} 
                  />
                  <span 
                    tabIndex={inputValue === word ? -1 : 0} 
                    title={word}
                    className={`${inputValue === word ? '' : 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded'} px-1 relative group`}
                    onMouseEnter={() => {
                      if (inputValue !== word) {
                        handleHintReveal(word);
                      }
                    }}
                    onFocus={() => {
                      if (inputValue !== word) {
                        handleHintReveal(word);
                      }
                    }}
                  >
                    {inputValue === word ? "✅" : "❌"}
                    {inputValue !== word && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        {word}
                      </div>
                    )}
                  </span>
                  <FrequencyBar frequency={words.getFrequency(word)} />
                </div>
              </li>
            );
          })}
        </ul>
          <div className="flex space-x-2 justify-end">
            <Button type="submit" disabled={!isCorrect()}>
              Refresh
            </Button>
            <Link href="/add-word">
              <Button type="button">Add New Word</Button>
            </Link>
          </div>
          </form>
        </main>
      </>
    )
  );
});

export default Home;
