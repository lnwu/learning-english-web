"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useLocalStorage } from "react-use";

const Home = () => {
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [value, setValue, remove] = useLocalStorage<[string, string][]>("words");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddWord = () => {
    if (!word || !translation) return;
    setValue(value ? [...value, [word, translation]] : [[word, translation]]);
    setWord("");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <form className="flex space-x-2" onSubmit={(e) => e.preventDefault()}>
        <Input placeholder="Word" value={word} onChange={(e) => setWord(e.target.value.toLowerCase())} />
        <Input placeholder="Translation" value={translation} onChange={(e) => setTranslation(e.target.value.toLowerCase())} />
        <Button onClick={handleAddWord}>Add</Button>
        <Button type="button" onClick={remove}>
          Remove
        </Button>
      </form>
      <div>{isClient && JSON.stringify(value)}</div>
    </main>
  );
};

export default Home;
