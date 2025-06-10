import { useLocalStorage } from "react-use";
import { makeAutoObservable } from "mobx";

class Words {
  randomWords: Map<string, string> = new Map();
  pendingWords: Map<string, string> = new Map();

  constructor() {
    makeAutoObservable(this);
  }

  setWords(words: [string, string][]) {
    this.randomWords = new Map(words);
  }

  addWord(word: string, translation: string) {
    this.randomWords.set(word, translation);
  }

  removeAllWords() {
    this.randomWords.clear();
  }

  setPendingWord(word: string, value: string) {
    this.pendingWords.set(word, value);
  }

  get correct() {
    return Array.from(this.pendingWords.entries()).every(([word, value]) => word === value);
  }

  get allWords() {
    return Array.from(this.randomWords.entries());
  }
}

const words = new Words();

export const useWords = () => {
  const [storedWords, setStoredWords] = useLocalStorage<[string, string][]>("words", []);

  if (storedWords && words.randomWords.size === 0) {
    words.setWords(storedWords);
  }

  const addWord = (word: string, translation: string) => {
    words.addWord(word, translation);
    setStoredWords(words.allWords);
  };

  const removeAllWords = () => {
    words.removeAllWords();
    setStoredWords([]);
  };

  return { words, addWord, removeAllWords };
};