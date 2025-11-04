import { useLocalStorage } from "react-use";
import { makeAutoObservable } from "mobx";
import { useEffect } from "react";

class Words {
  static MAX_RANDOM_WORDS = 5;

  wordTranslations: Map<string, string> = new Map();
  userInputs: Map<string, string> = new Map();
  // Cache for all words to avoid repeated localStorage reads
  private _allWordsCache: Map<string, string> = new Map();

  constructor() {
    makeAutoObservable(this);
  }

  setWords(words: [string, string][]) {
    this.wordTranslations = new Map(words);
    // Do not overwrite _allWordsCache here; cache should only be updated from localStorage or add/delete methods
  }

  addWord(word: string, translation: string) {
    this.wordTranslations.set(word, translation);
    this._allWordsCache.set(word, translation);
  }

  deleteWord(word: string) {
    this.wordTranslations.delete(word);
    this._allWordsCache.delete(word);
  }

  removeAllWords() {
    this.wordTranslations.clear();
    this._allWordsCache.clear();
  }

  setUserInput(word: string, value: string) {
    this.userInputs.set(word, value);
  }

  // Update cache from localStorage
  updateCache(words: [string, string][]) {
    this._allWordsCache = new Map(words);
  }

  get correct() {
    // Check if all current word translations have been correctly answered
    if (this.wordTranslations.size === 0 || this.userInputs.size !== this.wordTranslations.size) {
      return false;
    }
    return Array.from(this.userInputs.entries()).every(([word, value]) => word === value);
  }

  get allWords(): Map<string, string> {
    return this._allWordsCache;
  }

  // Fisher-Yates shuffle algorithm - O(n) complexity
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  getRandomWords(max: number = Words.MAX_RANDOM_WORDS): [string, string][] {
    const storedWords = Array.from(this._allWordsCache.entries());
    if (storedWords.length > 0) {
      const shuffled = this.shuffleArray(storedWords);
      return shuffled.slice(0, max);
    }
    return [];
  }
}

// Shared singleton instance of Words
const words = new Words();

export const useWords = () => {
  const [storedWords, setStoredWords] = useLocalStorage<[string, string][]>("words", []);

  useEffect(() => {
    if (storedWords) {
      words.updateCache(storedWords);
      if (words.wordTranslations.size === 0) {
        words.setWords(storedWords);
      }
    }
  }, [storedWords]);

  const addWord = (word: string, translation: string) => {
    words.addWord(word, translation);
    setStoredWords(Array.from(words.wordTranslations.entries()));
  };

  const deleteWord = (word: string) => {
    words.deleteWord(word);
    setStoredWords(Array.from(words.wordTranslations.entries()));
  };

  const removeAllWords = () => {
    words.removeAllWords();
    setStoredWords([]);
  };

  return { words, addWord, deleteWord, removeAllWords };
};
