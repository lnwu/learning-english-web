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
  updateDoc,
} from "firebase/firestore";
import { db, auth, ensureFirebaseAuth } from "@/lib/firebase";
import { useSession } from "next-auth/react";
import { makeAutoObservable } from "mobx";

class Words {
  static MAX_RANDOM_WORDS = 5;
  static MIN_FREQUENCY = -5; // Floor value for negative frequencies

  wordTranslations: Map<string, string> = new Map();
  wordFrequencies: Map<string, number> = new Map();
  wordIds: Map<string, string> = new Map(); // Track Firestore document IDs
  userInputs: Map<string, string> = new Map();

  constructor() {
    makeAutoObservable(this);
  }

  setWords(words: Array<{ word: string; translation: string; frequency?: number; id: string }>) {
    this.wordTranslations = new Map(words.map(w => [w.word, w.translation]));
    this.wordFrequencies = new Map(words.map(w => [w.word, w.frequency ?? 0]));
    this.wordIds = new Map(words.map(w => [w.word, w.id]));
  }

  addWord(word: string, translation: string, id: string) {
    this.wordTranslations.set(word, translation);
    this.wordFrequencies.set(word, 0);
    this.wordIds.set(word, id);
  }

  deleteWord(word: string) {
    this.wordTranslations.delete(word);
    this.wordFrequencies.delete(word);
    this.wordIds.delete(word);
  }

  removeAllWords() {
    this.wordTranslations.clear();
    this.wordFrequencies.clear();
    this.wordIds.clear();
  }

  updateFrequency(word: string, delta: number) {
    const currentFrequency = this.wordFrequencies.get(word) ?? 0;
    const newFrequency = Math.max(Words.MIN_FREQUENCY, currentFrequency + delta);
    this.wordFrequencies.set(word, newFrequency);
  }

  getFrequency(word: string): number {
    return this.wordFrequencies.get(word) ?? 0;
  }

  getWordId(word: string): string | undefined {
    return this.wordIds.get(word);
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
    if (storedWords.length === 0) {
      return [];
    }

    // Weighted random selection: lower frequency = higher selection probability
    const wordsWithWeights = storedWords.map(([word, translation]) => {
      const frequency = this.getFrequency(word);
      // Words with frequency <= 0 get highest weight
      // Weight calculation: use inverse of (frequency + offset) to ensure higher weight for lower frequencies
      const weight = frequency <= 0 ? 100 : Math.max(1, 100 / (frequency + 1));
      return { word, translation, weight };
    });

    const selected: [string, string][] = [];
    const available = [...wordsWithWeights];

    for (let i = 0; i < Math.min(max, storedWords.length); i++) {
      if (available.length === 0) break;

      // Calculate total weight
      const totalWeight = available.reduce((sum, item) => sum + item.weight, 0);
      
      // Random selection based on weight
      let random = Math.random() * totalWeight;
      let selectedIndex = 0;

      for (let j = 0; j < available.length; j++) {
        random -= available[j].weight;
        if (random <= 0) {
          selectedIndex = j;
          break;
        }
      }

      const selectedItem = available[selectedIndex];
      selected.push([selectedItem.word, selectedItem.translation]);
      available.splice(selectedIndex, 1);
    }

    return selected;
  }
}

const words = new Words();

export const useFirestoreWords = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupFirestore = async () => {
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }

      try {
        // Ensure Firebase Auth is signed in
        await ensureFirebaseAuth(session.user.email);

        const userId = session.user.email;
        const wordsCollection = collection(db, "users", userId, "words");

        // Real-time listener for automatic sync
        const unsubscribe = onSnapshot(
          wordsCollection,
          (snapshot) => {
            const wordsData: Array<{ word: string; translation: string; frequency?: number; id: string }> = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              wordsData.push({
                word: data.word,
                translation: data.translation,
                frequency: data.frequency ?? 0,
                id: doc.id,
              });
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

        return unsubscribe;
      } catch (err) {
        console.error("Firebase Auth error:", err);
        setError("Failed to authenticate with Firebase");
        setLoading(false);
      }
    };

    setupFirestore();
  }, [session?.user?.email]);

  const addWord = async (word: string, translation: string) => {
    if (!session?.user?.email) {
      throw new Error("User not authenticated");
    }

    try {
      // Ensure Firebase Auth is signed in
      await ensureFirebaseAuth(session.user.email);

      const userId = session.user.email;
      const wordsCollection = collection(db, "users", userId, "words");

      await addDoc(wordsCollection, {
        word,
        translation,
        frequency: 0,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error("Failed to add word:", err);
      throw new Error(`Failed to add word to cloud: ${err}`);
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

  const updateWordFrequency = async (word: string, delta: number) => {
    if (!session?.user?.email) {
      throw new Error("User not authenticated");
    }

    const wordId = words.getWordId(word);
    if (!wordId) {
      console.error("Word ID not found for:", word);
      return;
    }

    try {
      // Ensure Firebase Auth is signed in
      await ensureFirebaseAuth(session.user.email);

      const userId = session.user.email;
      const wordDocRef = doc(db, "users", userId, "words", wordId);

      // Update local state first for immediate UI feedback
      words.updateFrequency(word, delta);

      // Then update Firestore
      await updateDoc(wordDocRef, {
        frequency: words.getFrequency(word),
      });
    } catch (err) {
      console.error("Failed to update word frequency:", err);
      // Revert local change on error
      words.updateFrequency(word, -delta);
      throw new Error("Failed to update word frequency in cloud");
    }
  };

  return { words, addWord, deleteWord, removeAllWords, updateWordFrequency, loading, error };
};
