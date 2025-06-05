"use client";

import { useEffect, useState } from "react";
import { useLocalStorage } from "react-use";

const Home = () => {
  const [words] = useLocalStorage<[string, string][]>("words");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <main>
      <ul>
        {isClient && words && words.length > 0 ? (
          words.map(([word, translation], index) => (
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
