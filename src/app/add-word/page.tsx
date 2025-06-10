"use client";

import { Input, Button } from "@/components/ui";
import { useRef, useState } from "react";
import { useLocalStorage } from "react-use";
import Link from "next/link";

const Home = () => {
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [words, setWords, remove] = useLocalStorage<[string, string][]>("words");
  const inputRef = useRef<HTMLInputElement>(null);

  const clear = () => {
    setWord("");
    setTranslation("");
    inputRef.current?.focus();
  };

  const handleAddWord = () => {
    if (!word || !translation) return;

    const existingWord = words?.find(([w]) => w === word);
    if (existingWord) {
      alert(`The word "${word}" already exists in the list.`);
      clear();
      return;
    }

    setWords(words ? [...words, [word, translation]] : [[word, translation]]);

    clear();
  };

  return (
    <main className="space-y-4">
      <form className="flex space-x-2" onSubmit={(e) => e.preventDefault()}>
        <Input placeholder="Word" value={word} onChange={(e) => setWord(e.target.value.toLowerCase())} ref={inputRef} />
        <Input placeholder="Translation" value={translation} onChange={(e) => setTranslation(e.target.value.toLowerCase())} />
        <Button onClick={handleAddWord}>Add</Button>
        <Button type="button" onClick={remove}>
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
