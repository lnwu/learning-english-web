"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSession } from "next-auth/react";
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
    const randomWords = this.getRandomWords();
    return (
      this.userInputs.size === randomWords.length &&
      Array.from(this.userInputs.entries()).every(([word, value]) => word === value)
    );
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

export const useFirestoreWords = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }

    const userId = session.user.email;
    const wordsCollection = collection(db, "users", userId, "words");

    // Real-time listener for automatic sync
    const unsubscribe = onSnapshot(
      wordsCollection,
      (snapshot) => {
        const wordsData: [string, string][] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          wordsData.push([data.word, data.translation]);
        });
        words.setWords(wordsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore error:", err);
        setError("Failed to load words from cloud");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [session?.user?.email]);

  const addWord = async (word: string, translation: string) => {
    if (!session?.user?.email) {
      throw new Error("User not authenticated");
    }

    const userId = session.user.email;
    const wordsCollection = collection(db, "users", userId, "words");

    try {
      await addDoc(wordsCollection, {
        word,
        translation,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error("Failed to add word:", err);
      throw new Error("Failed to add word to cloud");
    }
  };

  const deleteWord = async (word: string) => {
    if (!session?.user?.email) {
      throw new Error("User not authenticated");
    }

    const userId = session.user.email;
    const wordsCollection = collection(db, "users", userId, "words");

    try {
      // Find and delete the document
      const q = query(wordsCollection, where("word", "==", word));
      const querySnapshot = await getDocs(q);

      const deletePromises = querySnapshot.docs.map((document) =>
        deleteDoc(doc(db, "users", userId, "words", document.id))
      );
      await Promise.all(deletePromises);
    } catch (err) {
      console.error("Failed to delete word:", err);
      throw new Error("Failed to delete word from cloud");
    }
  };

  const removeAllWords = async () => {
    if (!session?.user?.email) {
      throw new Error("User not authenticated");
    }

    const userId = session.user.email;
    const wordsCollection = collection(db, "users", userId, "words");

    try {
      const querySnapshot = await getDocs(wordsCollection);

      const deletePromises = querySnapshot.docs.map((document) =>
        deleteDoc(doc(db, "users", userId, "words", document.id))
      );

      await Promise.all(deletePromises);
    } catch (err) {
      console.error("Failed to remove all words:", err);
      throw new Error("Failed to remove words from cloud");
    }
  };

  return { words, addWord, deleteWord, removeAllWords, loading, error };
};
