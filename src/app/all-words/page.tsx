"use client";

import { useWords } from "@/hooks";
import { useEffect, useState } from "react";

const Home = () => {
  const { words } = useWords();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <main>
      <ul>
        {isClient && words.allWords.length > 0 ? (
          words.allWords.map(([word, translation], index) => (
            <li key={index}>
              <strong>{word}</strong>: {translation}
            </li>
          ))
        ) : (
          <li>No words added yet.</li>
        )}
      </ul>
    </main>
  );
};

export default Home;
