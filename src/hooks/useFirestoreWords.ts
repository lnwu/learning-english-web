"use client";

import { useEffect, useState, useRef } from "react";
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
  arrayUnion,
} from "firebase/firestore";
import { db, auth, ensureFirebaseAuth } from "@/lib/firebase";
import { useSession } from "next-auth/react";
import { makeAutoObservable } from "mobx";
import { SyncQueueManager } from "@/lib/syncQueue";
import { migrateLocalDataToFirestore, hasPendingMigration } from "@/lib/migrateLocalData";

class Words {
  static MAX_RANDOM_WORDS = 5;
  static MIN_FREQUENCY = -5; // Floor value for negative frequencies

  wordTranslations: Map<string, string> = new Map();
  wordFrequencies: Map<string, number> = new Map();
  wordIds: Map<string, string> = new Map(); // Track Firestore document IDs
  wordInputTimes: Map<string, number[]> = new Map(); // Track input times (in seconds)
  userInputs: Map<string, string> = new Map();

  constructor() {
    makeAutoObservable(this);
  }

  setWords(words: Array<{ word: string; translation: string; frequency?: number; inputTimes?: number[]; id: string }>) {
    this.wordTranslations = new Map(words.map(w => [w.word, w.translation]));
    this.wordFrequencies = new Map(words.map(w => [w.word, w.frequency ?? 0]));
    this.wordInputTimes = new Map(words.map(w => [w.word, w.inputTimes ?? []]));
    this.wordIds = new Map(words.map(w => [w.word, w.id]));
  }

  addWord(word: string, translation: string, id: string) {
    this.wordTranslations.set(word, translation);
    this.wordFrequencies.set(word, 0);
    this.wordInputTimes.set(word, []);
    this.wordIds.set(word, id);
  }

  deleteWord(word: string) {
    this.wordTranslations.delete(word);
    this.wordFrequencies.delete(word);
    this.wordInputTimes.delete(word);
    this.wordIds.delete(word);
  }

  removeAllWords() {
    this.wordTranslations.clear();
    this.wordFrequencies.clear();
    this.wordInputTimes.clear();
    this.wordIds.clear();
  }

  addInputTime(word: string, timeInSeconds: number) {
    const times = this.wordInputTimes.get(word) ?? [];
    times.push(timeInSeconds);
    this.wordInputTimes.set(word, times);
  }

  getInputTimes(word: string): number[] {
    return this.wordInputTimes.get(word) ?? [];
  }

  getAverageInputTime(word: string): number | null {
    const times = this.getInputTimes(word);
    if (times.length === 0) return null;
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  getOverallAverageInputTime(): number | null {
    const allTimes: number[] = [];
    this.wordInputTimes.forEach((times) => {
      allTimes.push(...times);
    });
    if (allTimes.length === 0) return null;
    return allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length;
  }

  // Get word length category: 0 (≤5), 1 (6-10), 2 (>10)
  getWordLengthCategory(word: string): number {
    const length = word.length;
    if (length <= 5) return 0;
    if (length <= 10) return 1;
    return 2;
  }

  // Get average input time for words in the same length category
  getAverageTimeByLengthCategory(category: number): number | null {
    const categoryTimes: number[] = [];
    
    this.wordTranslations.forEach((translation, word) => {
      if (this.getWordLengthCategory(word) === category) {
        const times = this.getInputTimes(word);
        categoryTimes.push(...times);
      }
    });
    
    if (categoryTimes.length === 0) return null;
    return categoryTimes.reduce((sum, time) => sum + time, 0) / categoryTimes.length;
  }

  // Calculate frequency adjustment based on input speed vs category average
  calculateFrequencyDelta(word: string, inputTimeSeconds: number): number {
    const category = this.getWordLengthCategory(word);
    const categoryAverage = this.getAverageTimeByLengthCategory(category);
    
    if (categoryAverage === null) {
      // No data yet for this category, use neutral increase
      return 1;
    }
    
    // If input time is less than category average, user is faster (more familiar)
    // Decrease frequency so word appears less often
    // If input time is greater than or equal to average, user is slower (less familiar)
    // Increase frequency so word appears more often
    return inputTimeSeconds < categoryAverage ? -1 : 1;
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

    // Weighted random selection based on mastery level and practice count
    // Lower mastery = higher selection probability
    // Fewer practice sessions = higher selection probability
    const wordsWithWeights = storedWords.map(([word, translation]) => {
      const frequency = this.getFrequency(word);
      const practiceCount = this.getInputTimes(word).length;
      
      // Calculate mastery level (0-4)
      const getMasteryLevel = (freq: number): number => {
        if (freq <= -3) return 0;
        if (freq <= 0) return 1;
        if (freq <= 3) return 2;
        if (freq <= 6) return 3;
        return 4;
      };
      const masteryLevel = getMasteryLevel(frequency);
      
      // Weight based on mastery level
      // Level 0 (not mastered): weight 100
      // Level 1 (beginner): weight 80
      // Level 2 (learning): weight 50
      // Level 3 (familiar): weight 20
      // Level 4 (mastered): weight 5
      const weightsByLevel = [100, 80, 50, 20, 5];
      const masteryWeight = weightsByLevel[masteryLevel];
      
      // Weight based on practice count (inverse relationship)
      // 0 practices: multiplier 2.0 (highest)
      // 1-2 practices: multiplier 1.5
      // 3-5 practices: multiplier 1.2
      // 6-10 practices: multiplier 1.0
      // 11+ practices: multiplier 0.8
      let practiceMultiplier: number;
      if (practiceCount === 0) {
        practiceMultiplier = 2.0; // New words get highest priority
      } else if (practiceCount <= 2) {
        practiceMultiplier = 1.5;
      } else if (practiceCount <= 5) {
        practiceMultiplier = 1.2;
      } else if (practiceCount <= 10) {
        practiceMultiplier = 1.0;
      } else {
        practiceMultiplier = 0.8; // Well-practiced words get lower priority
      }
      
      // Combined weight: mastery weight * practice multiplier
      const weight = masteryWeight * practiceMultiplier;
      
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
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);

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
            const wordsData: Array<{ word: string; translation: string; frequency?: number; inputTimes?: number[]; id: string }> = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              wordsData.push({
                word: data.word,
                translation: data.translation,
                frequency: data.frequency ?? 0,
                inputTimes: data.inputTimes ?? [],
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
        inputTimes: [],
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

  const updateWordFrequency = (word: string, delta: number) => {
    // Update local state immediately
    words.updateFrequency(word, delta);

    // Add to sync queue
    const wordId = words.getWordId(word);
    if (wordId) {
      SyncQueueManager.addToQueue({
        type: 'frequency',
        word,
        wordId,
        data: { frequency: words.getFrequency(word) },
      });
      setPendingCount(SyncQueueManager.getQueueLength());
    }
  };

  const saveInputTime = (word: string, timeInSeconds: number) => {
    // Update local MobX state immediately
    words.addInputTime(word, timeInSeconds);

    // Add to sync queue
    const wordId = words.getWordId(word);
    if (wordId) {
      SyncQueueManager.addToQueue({
        type: 'inputTime',
        word,
        wordId,
        data: { inputTime: timeInSeconds },
      });
      setPendingCount(SyncQueueManager.getQueueLength());
    }
  };

  // 批量同步到 Firestore
  const syncToFirestore = async () => {
    if (!session?.user?.email) {
      console.warn("User not authenticated, skipping sync");
      return;
    }

    const queue = SyncQueueManager.getQueue();
    if (queue.length === 0) {
      return;
    }

    setSyncing(true);
    console.log(`Syncing ${queue.length} items to Firestore...`);

    try {
      await ensureFirebaseAuth(session.user.email);
      const userId = session.user.email;

      // 按单词分组批量更新
      const updates: Map<string, { frequency?: number; inputTimes: number[] }> = new Map();

      queue.forEach(item => {
        const existing = updates.get(item.wordId) || { inputTimes: [] };

        if (item.type === 'frequency' && item.data.frequency !== undefined) {
          existing.frequency = item.data.frequency;
        }
        if (item.type === 'inputTime' && item.data.inputTime !== undefined) {
          existing.inputTimes.push(item.data.inputTime);
        }

        updates.set(item.wordId, existing);
      });

      // 批量更新到 Firestore
      const updatePromises = Array.from(updates.entries()).map(async ([wordId, data]) => {
        const wordDocRef = doc(db, "users", userId, "words", wordId);
        const updateData: Record<string, number | ReturnType<typeof arrayUnion>> = {};

        if (data.frequency !== undefined) {
          updateData.frequency = data.frequency;
        }
        if (data.inputTimes.length > 0) {
          // 使用 arrayUnion 避免覆盖
          updateData.inputTimes = arrayUnion(...data.inputTimes);
        }

        await updateDoc(wordDocRef, updateData);
      });

      await Promise.all(updatePromises);

      // 同步成功，清空队列
      SyncQueueManager.clearQueue();
      setPendingCount(0);

      console.log("Sync completed successfully");
    } catch (error) {
      console.error("Sync failed:", error);

      // 增加重试次数
      queue.forEach(item => {
        SyncQueueManager.incrementRetry(item.id);
      });

      setPendingCount(SyncQueueManager.getQueueLength());
    } finally {
      setSyncing(false);
    }
  };

  // 定时同步
  useEffect(() => {
    if (!session?.user?.email) return;
    
    const doSync = () => syncToFirestore();

    // 初始化：显示待同步数量
    setPendingCount(SyncQueueManager.getQueueLength());

    // 检查是否有待迁移的数据
    if (hasPendingMigration() && words.wordIds.size > 0) {
      console.log("Found pending migration data, migrating...");
      migrateLocalDataToFirestore(session.user.email, words.wordIds).then(result => {
        console.log("Migration result:", result);
        if (result.success) {
          console.log(`Migrated ${result.migratedCount} items`);
        } else {
          console.error("Migration errors:", result.errors);
        }
      });
    }

    // 设置定时器：每 30 秒同步一次
    const SYNC_INTERVAL = 30 * 1000; // 30 秒

    syncTimerRef.current = setInterval(doSync, SYNC_INTERVAL);

    // 页面加载时立即同步一次（清理积压）
    doSync();

    // 清理定时器
    return () => {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email]);

  // 页面可见性变化时同步
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && session?.user?.email) {
        syncToFirestore();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email]);

  // 网络恢复时同步
  useEffect(() => {
    const handleOnline = () => {
      if (session?.user?.email) {
        console.log('Network restored, syncing...');
        syncToFirestore();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email]);

  // 页面卸载前同步
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (SyncQueueManager.getQueueLength() > 0) {
        syncToFirestore();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { 
    words, 
    addWord, 
    deleteWord, 
    removeAllWords, 
    updateWordFrequency, 
    saveInputTime,
    syncToFirestore,
    loading, 
    error, 
    syncing,
    pendingCount,
  };
};
