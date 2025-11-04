"use client";

import { Input, Button } from "@/components/ui";
import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useWords } from "@/hooks";

// Move fallback dictionary outside component to avoid recreation on every render
const FALLBACK_DICTIONARY: Record<string, string> = {
  hello: "你好",
  world: "世界",
  love: "爱",
  water: "水",
  food: "食物",
  house: "房子",
  car: "汽车",
  book: "书",
  computer: "电脑",
  friend: "朋友",
  family: "家庭",
  work: "工作",
  school: "学校",
  time: "时间",
  money: "钱",
  happy: "快乐",
  good: "好",
  bad: "坏",
  big: "大",
  small: "小",
};

const Home = () => {
  const { words, addWord } = useWords();
  const [word, setWord] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const clear = useCallback(() => {
    setWord("");
    inputRef.current?.focus();
  }, []);

  const translateToChinese = useCallback(async (word: string): Promise<string | null> => {
    try {
      // Try Google Translate API first
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(word)}`);

      if (!response.ok) {
        throw new Error("Translation failed");
      }

      const data = await response.json();
      const translation = data[0][0][0];

      if (translation && translation !== word) {
        return translation;
      }
      throw new Error("No translation found");
    } catch (error) {
      console.error("Translation API error:", error);
      // Fallback to local dictionary
      return FALLBACK_DICTIONARY[word.toLowerCase()] || null;
    }
  }, []);

  // Combined function to validate and get definition in a single API call
  const validateAndGetDefinition = useCallback(async (word: string): Promise<{ isValid: boolean; definition: string | null }> => {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!response.ok) {
        return { isValid: false, definition: null };
      }
      const data = await response.json();
      const definition = data.length > 0 ? data[0].meanings[0].definitions[0].definition : null;
      return { isValid: true, definition };
    } catch {
      return { isValid: false, definition: null };
    }
  }, []);

  const handleAddWord = useCallback(async () => {
    if (!word) return;

    setLoading(true);

    const existingWord = words.wordTranslations.has(word);
    if (existingWord) {
      alert(`The word "${word}" already exists in the list.`);
      clear();
      setLoading(false);
      return;
    }

    const isValidWord = /^[a-zA-Z]+$/.test(word);
    if (!isValidWord) {
      alert(`The word "${word}" contains invalid characters or is a typo.`);
      clear();
      setLoading(false);
      return;
    }

    // Parallel API calls for better performance
    const [validationResult, chineseTranslation] = await Promise.all([
      validateAndGetDefinition(word),
      translateToChinese(word)
    ]);

    if (!validationResult.isValid) {
      alert(`The word "${word}" is not recognized as a real word.`);
      clear();
      setLoading(false);
      return;
    }

    const englishDefinition = validationResult.definition;

    let combinedTranslation = "";
    if (chineseTranslation && englishDefinition) {
      combinedTranslation = `${englishDefinition}\n${chineseTranslation}`;
    } else if (chineseTranslation) {
      combinedTranslation = chineseTranslation;
    } else if (englishDefinition) {
      combinedTranslation = englishDefinition;
    } else {
      alert(`Could not get translation for "${word}". Please try again.`);
      clear();
      setLoading(false);
      return;
    }

    addWord(word, combinedTranslation);
    clear();
    setLoading(false);
  }, [word, words.wordTranslations, clear, validateAndGetDefinition, translateToChinese, addWord]);

  return (
    <main className="space-y-4">
      <form className="flex space-x-2" onSubmit={(e) => e.preventDefault()}>
        <Input placeholder="Word" value={word} onChange={(e) => setWord(e.target.value.toLowerCase())} ref={inputRef} />
        <Button onClick={handleAddWord} disabled={loading}>
          Add
        </Button>
        <Link href="/">
          <Button type="button">Home</Button>
        </Link>
        <Link href="/all-words">
          <Button type="button">View All Words</Button>
        </Link>
      </form>
    </main>
  );
};

export default Home;
