"use client";

import { useFirestoreWords } from "@/hooks";
import { migrateLocalStorageToFirestore } from "@/lib/migrateToFirestore";
import { useSession } from "next-auth/react";
import { useSyncExternalStore, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";

// Subscribe function for client-side only rendering
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

const Home = () => {
  const { data: session } = useSession();
  const { words, deleteWord, loading, error } = useFirestoreWords();
  const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [migrating, setMigrating] = useState(false);
  const [hasLocalStorage, setHasLocalStorage] = useState(false);

  // Check if localStorage has data
  useEffect(() => {
    if (isClient) {
      const storedWords = localStorage.getItem("words");
      setHasLocalStorage(!!storedWords && JSON.parse(storedWords).length > 0);
    }
  }, [isClient]);

  const handleMigration = async () => {
    if (!session?.user?.email) {
      alert("Please sign in first");
      return;
    }

    const confirmMigrate = confirm(
      "This will copy your words from browser storage to the cloud. Continue?"
    );

    if (!confirmMigrate) return;

    setMigrating(true);
    try {
      const result = await migrateLocalStorageToFirestore(session.user.email);
      if (result.success) {
        alert(`Successfully migrated ${result.count} words to the cloud! 🎉`);
        setHasLocalStorage(false);
        // Optional: Clear localStorage after successful migration
        if (confirm("Migration complete! Clear browser storage?")) {
          localStorage.removeItem("words");
        }
      } else {
        alert("Migration failed. Please try again or check console for errors.");
      }
    } catch (error) {
      console.error("Migration error:", error);
      alert("Migration failed. Please try again.");
    } finally {
      setMigrating(false);
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto p-4">
        <div className="text-center">Loading your words...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto p-4">
        <div className="text-center text-red-500">Error: {error}</div>
        <div className="text-center mt-4">
          <Link href="/add-word">
            <Button>Back to Add Word</Button>
          </Link>
        </div>
      </main>
    );
  }

  const allWords = isClient ? words.allWords : new Map<string, string>();

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">All Words</h1>

      {/* Migration Banner */}
      {hasLocalStorage && isClient && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 text-blue-900">
            📦 Migrate to Cloud Storage
          </h2>
          <p className="mb-3 text-sm text-blue-800">
            You have words stored locally in your browser. Migrate them to the cloud
            to access on all your devices and never lose your vocabulary!
          </p>
          <Button
            onClick={handleMigration}
            disabled={migrating}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {migrating ? "Migrating..." : "Migrate to Cloud"}
          </Button>
        </div>
      )}

      <ul className="space-y-2">
        {allWords.size > 0 ? (
          Array.from(allWords.entries()).map(([word, translation], index) => (
            <li key={index} className="flex items-center space-x-2 p-3 border rounded">
              <button
                onClick={() => deleteWord(word)}
                title="Delete"
                className="text-red-600 hover:text-red-800"
              >
                🗑️
              </button>
              <div className="flex-1">
                <strong className="block">{word}</strong>
                <span className="text-sm text-gray-600">{translation}</span>
              </div>
            </li>
          ))
        ) : (
          <li className="text-center text-gray-500 py-8">No words added yet.</li>
        )}
      </ul>
      <Link href="/add-word">
        <Button className="mt-4">Back to Add Word</Button>
      </Link>
    </main>
  );
};

export default Home;
