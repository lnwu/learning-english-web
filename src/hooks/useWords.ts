import { makeAutoObservable } from "mobx";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

class Words {
  static MAX_RANDOM_WORDS = 5;

  wordTranslations: Map<string, string> = new Map();
  userInputs: Map<string, string> = new Map();
  loading: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  setWords(words: [string, string][]) {
    this.wordTranslations = new Map(words);
  }

  addWord(word: string, translation: string) {
    this.wordTranslations.set(word, translation);
  }

  deleteWord(word: string) {
    this.wordTranslations.delete(word);
  }

  removeAllWords() {
    this.wordTranslations.clear();
  }

  setUserInput(word: string, value: string) {
    this.userInputs.set(word, value);
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  get correct() {
    const randomWords = this.getRandomWords();
    return (
      this.userInputs.size === randomWords.length &&
      Array.from(this.userInputs.entries()).every(([word, value]) => word === value)
    );
  }

  get allWords(): Map<string, string> {
    return this.wordTranslations;
  }

  getRandomWords(max: number = Words.MAX_RANDOM_WORDS): [string, string][] {
    const storedWords = Array.from(this.wordTranslations.entries());
    if (storedWords.length > 0) {
      const shuffled = [...storedWords].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, max);
    }
    return [];
  }
}

const words = new Words();

export const useWords = () => {
  const { status } = useSession();
  const [initialized, setInitialized] = useState(false);

  // Fetch words from API when user is authenticated
  useEffect(() => {
    const fetchWords = async () => {
      if (status === "authenticated" && !initialized) {
        words.setLoading(true);
        try {
          const response = await fetch("/api/words");
          if (response.ok) {
            const data = await response.json();
            const wordMap: [string, string][] = data.map((item: { word: string; translation: string }) => [
              item.word,
              item.translation,
            ]);
            words.setWords(wordMap);
          }
        } catch (error) {
          console.error("Failed to fetch words:", error);
        } finally {
          words.setLoading(false);
          setInitialized(true);
        }
      }
    };

    fetchWords();
  }, [status, initialized]);

  const addWord = async (word: string, translation: string) => {
    if (status !== "authenticated") {
      throw new Error("User must be authenticated to add words");
    }

    try {
      const response = await fetch("/api/words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ word, translation }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add word");
      }

      words.addWord(word, translation);
    } catch (error) {
      console.error("Failed to add word:", error);
      throw error;
    }
  };

  const deleteWord = async (word: string) => {
    if (status !== "authenticated") {
      throw new Error("User must be authenticated to delete words");
    }

    try {
      const response = await fetch(`/api/words/${encodeURIComponent(word)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete word");
      }

      words.deleteWord(word);
    } catch (error) {
      console.error("Failed to delete word:", error);
      throw error;
    }
  };

  const removeAllWords = async () => {
    if (status !== "authenticated") {
      throw new Error("User must be authenticated to delete words");
    }

    try {
      const response = await fetch("/api/words", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete all words");
      }

      words.removeAllWords();
    } catch (error) {
      console.error("Failed to delete all words:", error);
      throw error;
    }
  };

  return { words, addWord, deleteWord, removeAllWords };
};
