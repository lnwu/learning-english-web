import { useLocalStorage } from "react-use";
import { makeAutoObservable } from "mobx";

class Words {
  static MAX_RANDOM_WORDS = 5;

  wordTranslations: Map<string, string> = new Map();
  userInputs: Map<string, string> = new Map();

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

  get correct() {
    return Array.from(this.userInputs.entries()).every(([word, value]) => word === value);
  }

  get allWords(): Map<string, string> {
    return this.wordTranslations;
  }

  getRandomWords(max: number = Words.MAX_RANDOM_WORDS): [string, string][] {
    const storedWords = Array.from(this.allWords.entries());
    if (storedWords.length > 0) {
      const shuffled = [...storedWords].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, max);
    }
    return [];
  }
}

const words = new Words();

export const useWords = () => {
  const [storedWords, setStoredWords] = useLocalStorage<[string, string][]>("words", []);

  if (storedWords && words.wordTranslations.size === 0) {
    words.setWords(storedWords);
  }

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