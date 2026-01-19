# Migrating localStorage Data to Firebase Firestore

This guide explains how to migrate your existing vocabulary words from browser localStorage to Firebase Firestore for cloud synchronization.

## Why Migrate?

If you've been using the Learning English app and have words stored in your browser's localStorage, you'll want to migrate them to Firestore to:

- ✅ Access your words on all devices
- ✅ Never lose your data if you clear browser cache
- ✅ Automatically sync new words across devices
- ✅ Backup your vocabulary in the cloud

## Prerequisites

Before migrating, make sure you have:

1. ✅ Completed the Firebase Firestore setup (see [FIREBASE_IMPLEMENTATION_GUIDE.md](./FIREBASE_IMPLEMENTATION_GUIDE.md))
2. ✅ Firestore database enabled and configured
3. ✅ Security rules properly set up
4. ✅ Successfully signed in with Google OAuth
5. ✅ Existing words in localStorage (check by opening browser DevTools → Application → Local Storage)

## Migration Options

### Option 1: Automatic Migration (Recommended)

The implementation includes a built-in migration utility that you can trigger with a button click.

#### Step 1: Add Migration Button to Your App

Update `src/app/all-words/page.tsx` to include the migration button:

```typescript
"use client";

import { useFirestoreWords } from "@/hooks";
import { migrateLocalStorageToFirestore } from "@/lib/migrateToFirestore";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui";

const AllWordsPage = () => {
  const { data: session } = useSession();
  const { words, deleteWord, removeAllWords, loading } = useFirestoreWords();
  const [migrating, setMigrating] = useState(false);
  const [hasLocalStorage, setHasLocalStorage] = useState(false);

  // Check if localStorage has data
  useEffect(() => {
    const storedWords = localStorage.getItem("words");
    setHasLocalStorage(!!storedWords && JSON.parse(storedWords).length > 0);
  }, []);

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
    return <div className="text-center p-4">Loading your words...</div>;
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">All Words</h1>

      {/* Migration Banner */}
      {hasLocalStorage && (
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
            className="bg-blue-600 hover:bg-blue-700"
          >
            {migrating ? "Migrating..." : "Migrate to Cloud"}
          </Button>
        </div>
      )}

      {/* Rest of your component */}
      <div className="space-y-4">
        {Array.from(words.allWords.entries()).map(([word, translation]) => (
          <div key={word} className="p-4 border rounded">
            <div className="font-semibold">{word}</div>
            <div className="text-sm text-gray-600">{translation}</div>
            <button
              onClick={() => deleteWord(word)}
              className="mt-2 text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </main>
  );
};

export default AllWordsPage;
```

#### Step 2: Test the Migration

1. Open your app at http://localhost:3000
2. Sign in with Google
3. Navigate to the "All Words" page
4. You should see a blue banner at the top if you have words in localStorage
5. Click "Migrate to Cloud" button
6. Confirm the migration
7. Wait for success message (usually 2-5 seconds for 100 words)
8. Check Firebase Console to verify your words are now in Firestore

### Option 2: Manual Migration via Browser Console

If you prefer to migrate manually or need to debug:

#### Step 1: Open Browser DevTools

1. Press F12 (or Cmd+Option+I on Mac)
2. Go to Console tab
3. Make sure you're on your app's page and signed in

#### Step 2: Run Migration Script

Copy and paste this code into the console:

```javascript
// Check what's in localStorage
const storedWords = localStorage.getItem("words");
if (!storedWords) {
  console.log("No words found in localStorage");
} else {
  const words = JSON.parse(storedWords);
  console.log(`Found ${words.length} words to migrate:`, words);
}

// To manually trigger migration (after implementing useFirestoreWords):
// Import the migration function and run it with your email
```

#### Step 3: Verify in Firestore Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click "Firestore Database"
4. Navigate to: `users` → `{your-email}` → `words`
5. You should see all your words with their translations

## Migration Utility Details

The migration utility is located at `src/lib/migrateToFirestore.ts`:

```typescript
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const migrateLocalStorageToFirestore = async (userId: string) => {
  try {
    // Get data from localStorage
    const storedWords = localStorage.getItem("words");
    if (!storedWords) {
      console.log("No words to migrate");
      return { success: true, count: 0 };
    }

    const words: [string, string][] = JSON.parse(storedWords);
    const wordsCollection = collection(db, "users", userId, "words");

    // Upload each word to Firestore
    let migratedCount = 0;
    for (const [word, translation] of words) {
      await addDoc(wordsCollection, {
        word,
        translation,
        createdAt: new Date(),
      });
      migratedCount++;
    }

    console.log(`Successfully migrated ${migratedCount} words`);
    
    return { success: true, count: migratedCount };
  } catch (error) {
    console.error("Migration failed:", error);
    return { success: false, count: 0, error };
  }
};
```

### How It Works

1. **Reads localStorage**: Gets the "words" key from localStorage
2. **Parses data**: Converts JSON string to array of [word, translation] tuples
3. **Creates Firestore documents**: Adds each word to your user's Firestore collection
4. **Adds metadata**: Includes a `createdAt` timestamp for each word
5. **Returns result**: Success status and count of migrated words

## Data Structure

### Before Migration (localStorage)

```javascript
localStorage["words"] = JSON.stringify([
  ["hello", "Used as a greeting\n你好"],
  ["world", "The earth\n世界"],
  // ...
]);
```

Note: `translation` combines the English definition and Chinese translation with a newline (`English definition\n中文`). The practice page allows inline editing of the Chinese part via double-click, and empty values after `trim()` are not allowed.

### After Migration (Firestore)

```
Firestore Database
└── users
    └── your-email@gmail.com
        └── words
            ├── abc123def456
            │   ├── word: "hello"
            │   ├── translation: "Used as a greeting\n你好"
            │   └── createdAt: 2024-11-06T10:00:00Z
            └── xyz789uvw012
                ├── word: "world"
                ├── translation: "The earth\n世界"
                └── createdAt: 2024-11-06T10:00:01Z
```

## Migration Time Estimates

| Number of Words | Estimated Time |
|-----------------|----------------|
| 1-50            | 2-5 seconds    |
| 51-100          | 5-10 seconds   |
| 101-500         | 10-30 seconds  |
| 500+            | 30-60 seconds  |

## After Migration

### What to Do Next

1. **Test on another device**
   - Open the app on your phone or tablet
   - Sign in with the same Google account
   - Your words should appear automatically!

2. **Clear localStorage (optional)**
   - Once you verify words are in Firestore
   - You can safely clear localStorage
   - Words will now load from the cloud

3. **Switch to useFirestoreWords**
   - Update your components to use `useFirestoreWords` instead of `useWords`
   - See [FIREBASE_IMPLEMENTATION_GUIDE.md](./FIREBASE_IMPLEMENTATION_GUIDE.md) steps 15-17

### Verify Migration Success

✅ Check that words appear in Firebase Console
✅ Check that words load in the app after refresh
✅ Check that new words added sync to Firestore
✅ Check that words appear on other devices

## Troubleshooting

### Issue: "Migration failed" error

**Possible causes:**
- Not signed in with Google OAuth
- Firestore security rules not configured correctly
- Network connection issues
- Firebase not initialized

**Solution:**
1. Make sure you're signed in
2. Check browser console for specific error messages
3. Verify Firestore security rules match your implementation
4. Check Firebase Console for any service issues

### Issue: Words not appearing after migration

**Solution:**
1. Refresh the page
2. Check Firebase Console to verify words were uploaded
3. Check browser console for errors
4. Verify you're using `useFirestoreWords` hook in your components

### Issue: Duplicate words after migration

**Solution:**
- The migration utility doesn't check for duplicates
- Run this once per device
- After successful migration, clear localStorage to avoid re-running

### Issue: Migration is slow

**Solution:**
- Normal for 500+ words (uploads one at a time)
- Don't close the browser during migration
- Check your internet connection speed
- Consider breaking into smaller batches if needed

## Best Practices

### Do's ✅

- ✅ Run migration only once per device
- ✅ Verify migration success before clearing localStorage
- ✅ Keep localStorage until you're confident in cloud sync
- ✅ Test on another device after migration
- ✅ Check Firebase Console to verify data

### Don'ts ❌

- ❌ Don't run migration multiple times (creates duplicates)
- ❌ Don't close browser during migration
- ❌ Don't delete localStorage before verifying Firestore has the data
- ❌ Don't modify Firestore security rules without understanding them

## Migration Checklist

Use this checklist when migrating:

- [ ] Firebase Firestore is set up and configured
- [ ] Security rules are properly configured
- [ ] Signed in with Google OAuth
- [ ] Verified words exist in localStorage
- [ ] Added migration button to UI (or ready to use console)
- [ ] Clicked "Migrate to Cloud" button
- [ ] Saw success message
- [ ] Checked Firebase Console - words are there
- [ ] Refreshed app - words still load
- [ ] Tested adding new word - syncs to Firestore
- [ ] (Optional) Tested on another device - words appear
- [ ] (Optional) Cleared localStorage

## Need Help?

If you encounter issues:

1. **Check the implementation guide**: [FIREBASE_IMPLEMENTATION_GUIDE.md](./FIREBASE_IMPLEMENTATION_GUIDE.md)
2. **Check browser console**: Look for specific error messages
3. **Check Firebase Console**: Verify project setup and rules
4. **Check network tab**: See if requests are being made to Firestore
5. **Review security rules**: Ensure they match your implementation

## Summary

Migration is straightforward:
1. Set up Firebase Firestore
2. Add migration button to your app
3. Click to migrate
4. Verify in Firebase Console
5. Test on other devices
6. Enjoy cloud-synced vocabulary! 🎉

**Time to migrate**: 2-5 minutes
**Difficulty**: Easy (just click a button!)
**Risk**: Low (doesn't delete localStorage automatically)
