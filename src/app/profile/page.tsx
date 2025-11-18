"use client";

import { Button } from "@/components/ui";
import { useFirestoreWords } from "@/hooks";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

const Profile = observer(() => {
  const { data: session } = useSession();
  const { words, loading, error } = useFirestoreWords();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (loading) {
    return (
      <main>
        <div className="text-center">Loading your profile...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <div className="text-center text-red-500">Error: {error}</div>
      </main>
    );
  }

  const totalWords = words.allWords.size;
  const overallAverageTime = words.getOverallAverageInputTime();
  
  // Calculate statistics
  const wordsWithTimes: Array<{ word: string; avgTime: number; count: number }> = [];
  words.allWords.forEach((translation, word) => {
    const times = words.getInputTimes(word);
    if (times.length > 0) {
      const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
      wordsWithTimes.push({ word, avgTime, count: times.length });
    }
  });

  // Sort by average time (slowest first)
  wordsWithTimes.sort((a, b) => b.avgTime - a.avgTime);

  return (
    isClient && (
      <main className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">User Profile</h1>

        {/* User Info */}
        {session?.user && (
          <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="space-y-2">
              <p><strong>Email:</strong> {session.user.email}</p>
              {session.user.name && <p><strong>Name:</strong> {session.user.name}</p>}
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Learning Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-300">
                {totalWords}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Words</div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
              <div className="text-3xl font-bold text-green-600 dark:text-green-300">
                {overallAverageTime !== null ? `${overallAverageTime.toFixed(1)}s` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Average Input Time</div>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-300">
                {wordsWithTimes.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Words Practiced</div>
            </div>
          </div>
        </div>

        {/* Word Performance Details */}
        {wordsWithTimes.length > 0 && (
          <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Word Performance</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Words sorted by average input time (slowest first)
            </p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {wordsWithTimes.map(({ word, avgTime, count }) => (
                <div
                  key={word}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <div className="flex-1">
                    <span className="font-medium">{word}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      ({count} practice{count !== 1 ? 's' : ''})
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{avgTime.toFixed(1)}s</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Frequency: {words.getFrequency(word)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Data Message */}
        {wordsWithTimes.length === 0 && (
          <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No practice data yet. Start practicing words to see your statistics!
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex space-x-4">
          <Link href="/home">
            <Button>Practice Words</Button>
          </Link>
          <Link href="/add-word">
            <Button variant="outline">Add New Word</Button>
          </Link>
          <Link href="/all-words">
            <Button variant="outline">View All Words</Button>
          </Link>
        </div>
      </main>
    )
  );
});

export default Profile;
