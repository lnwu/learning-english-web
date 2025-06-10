"use client";

import { Input, Button } from "@/components/ui";
import { useRef, useState } from "react";
import Link from "next/link";
import { useWords } from "@/hooks";

const Home = () => {
  const { words, addWord, removeAllWords } = useWords();
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const clear = () => {
    setWord("");
    setTranslation("");
    inputRef.current?.focus();
  };

  const handleAddWord = () => {
    if (!word || !translation) return;

    const existingWord = words.randomWords.has(word);
    if (existingWord) {
      alert(`The word "${word}" already exists in the list.`);
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
        <Input placeholder="Translation" value={translation} onChange={(e) => setTranslation(e.target.value.toLowerCase())} />
        <Button onClick={handleAddWord}>Add</Button>
        <Button type="button" onClick={removeAllWords}>
          Remove All
        </Button>
      </form>
      <div className="flex space-x-2">
        <Link href="/">
          <Button type="button">Home</Button>
        </Link>
        <Link href="/all-words">
          <Button type="button">View All Words</Button>
        </Link>
      </div>
    </main>
  );
};

export default Home;
