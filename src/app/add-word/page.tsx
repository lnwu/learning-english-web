"use client";

import { Input, Button } from "@/components/ui";
import { useRef, useState } from "react";
import Link from "next/link";
import { useWords } from "@/hooks";

const Home = () => {
  const { words, addWord } = useWords();
  const [word, setWord] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const clear = () => {
    setWord("");
    inputRef.current?.focus();
  };

  const validateWord = async (word: string) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!response.ok) {
        throw new Error("Word not found");
      }
      const data = await response.json();
      return data.length > 0 ? data[0].meanings[0].definitions[0].definition : null;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = async () => {
    if (!word) return;

    const existingWord = words.wordTranslations.has(word);
    if (existingWord) {
      alert(`The word "${word}" already exists in the list.`);
      clear();
      return;
    }

    const isValidWord = /^[a-zA-Z]+$/.test(word);
    if (!isValidWord) {
      alert(`The word "${word}" contains invalid characters or is a typo.`);
      clear();
      return;
    }

    const translation = await validateWord(word);
    if (!translation) {
      alert(`The word "${word}" is not recognized as a real word.`);
      clear();
      return;
    }

    addWord(word, translation);
    clear();
  };

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
