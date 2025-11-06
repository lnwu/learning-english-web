# Firebase Firestore Implementation Guide

This is a step-by-step practical guide to implement Firebase Firestore in the Learning English app.

## Prerequisites

- Existing Learning English app with Google OAuth already configured
- Node.js and npm installed
- Firebase account (free - use your existing Google account)

## Implementation Steps

### 1. Create Firebase Project (5 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: **learning-english** (or your preferred name)
4. Click **Continue**
5. (Optional) **Enable Google Analytics**: Toggle ON if you want usage analytics
   - Recommended for tracking active users
   - Choose default account or create new one
6. Click **Create project**
7. Wait 30-60 seconds for project creation
8. Click **Continue** when ready

### 2. Enable Firestore Database (3 minutes)

1. In left sidebar, click **Build** → **Firestore Database**
2. Click **Create database** button
3. **Security rules**: Choose **Start in production mode**
   - We'll add proper rules in next step
4. **Cloud Firestore location**: 
   - Choose **us-central** (if in North America)
   - Or select the region closest to your users
   - ⚠️ **Cannot be changed later!**
5. Click **Enable**
6. Wait for database creation (30 seconds)

### 3. Configure Security Rules (2 minutes)

1. In Firestore Database page, click **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write only their own data
    // Using email as document ID, so we check against the email claim
    match /users/{userId}/words/{wordId} {
      allow read, write: if request.auth != null && request.auth.token.email == userId;
    }
    
    // Allow users to access their user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.token.email == userId;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **Publish**

**What these rules do:**
- Users must be authenticated (signed in with Google)
- Users can only access their own data
- Data is organized under `/users/{userId}/words/`
- All other access is denied

### 4. Register Web App in Firebase (3 minutes)

1. Click the **gear icon** (⚙️) next to **Project Overview**
2. Click **Project settings**
3. Scroll to **Your apps** section
4. Click the web icon **`</>`** to add a web app
5. Enter app nickname: **learning-english-web**
6. ✅ Check **"Also set up Firebase Hosting"** (optional but recommended)
7. Click **Register app**
8. **Copy the Firebase configuration** - you'll need this!

Example configuration (yours will be different):
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAbc123XYZ...",
  authDomain: "learning-english-12345.firebaseapp.com",
  projectId: "learning-english-12345",
  storageBucket: "learning-english-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

9. Click **Continue to console**

### 5. Install Firebase SDK (1 minute)

Open terminal in your project directory:

```bash
cd /path/to/learning-english
npm install firebase
```

Expected output:
```
added 1 package, and audited 417 packages in 3s
```

### 6. Create Firebase Configuration File (2 minutes)

Create a new file: **`src/lib/firebase.ts`**

```typescript
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInWithCustomToken } from "firebase/auth";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
```

### 7. Add Environment Variables (3 minutes)

#### Update `.env.local`:

Add these lines (replace with your actual values from step 4):

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAbc123XYZ...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=learning-english-12345.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=learning-english-12345
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=learning-english-12345.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456
```

#### Update `.env.example`:

Add these lines (template for other developers):

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 8. Create Firestore Hook (10 minutes)

Create a new file: **`src/hooks/useFirestoreWords.ts`**

```typescript
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
```

### 9. Update Hooks Index (1 minute)

Update **`src/hooks/index.ts`**:

```typescript
export { useWords } from "./useWords";
export { useFirestoreWords } from "./useFirestoreWords";
```

### 10. Create Migration Utility (5 minutes)

Create a new file: **`src/lib/migrateToFirestore.ts`**

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

### 11. Update Add Word Page (5 minutes)

Update **`src/app/add-word/page.tsx`**:

Replace the import:
```typescript
// Old
import { useWords } from "@/hooks";

// New
import { useFirestoreWords } from "@/hooks";
```

Replace the hook usage:
```typescript
// Old
const { words, addWord } = useWords();

// New
const { words, addWord, loading: wordsLoading, error: wordsError } = useFirestoreWords();
```

Add loading state to the UI:
```typescript
if (wordsLoading) {
  return (
    <main className="space-y-4">
      <div className="text-center">Loading your words...</div>
    </main>
  );
}

if (wordsError) {
  return (
    <main className="space-y-4">
      <div className="text-center text-red-500">
        Error: {wordsError}
      </div>
    </main>
  );
}
```

### 12. Update Home Page (5 minutes)

Update **`src/app/home/page.tsx`**:

Replace imports and hook usage similar to step 11:

```typescript
import { useFirestoreWords } from "@/hooks";

const Home = () => {
  const { words, loading, error } = useFirestoreWords();
  
  // ... rest of your component
```

Add loading state:
```typescript
if (loading) {
  return (
    <main className="container mx-auto p-4">
      <div className="text-center">Loading your words...</div>
    </main>
  );
}
```

### 13. Update All Words Page (5 minutes)

Update **`src/app/all-words/page.tsx`**:

```typescript
import { useFirestoreWords } from "@/hooks";

const AllWords = () => {
  const { words, deleteWord, removeAllWords, loading, error } = useFirestoreWords();
  
  // Add loading state
  if (loading) {
    return (
      <main className="container mx-auto p-4">
        <div className="text-center">Loading your words...</div>
      </main>
    );
  }
  
  // ... rest of your component
```

### 14. Add Migration Button (Optional - 5 minutes)

Add a one-time migration button for existing users.

Update **`src/app/all-words/page.tsx`** to include:

```typescript
import { migrateLocalStorageToFirestore } from "@/lib/migrateToFirestore";
import { useSession } from "next-auth/react";
import { useState } from "react";

const AllWords = () => {
  const { data: session } = useSession();
  const [migrating, setMigrating] = useState(false);
  
  const handleMigration = async () => {
    if (!session?.user?.email) return;
    
    const confirmMigrate = confirm(
      "This will copy your words from browser storage to the cloud. Continue?"
    );
    
    if (!confirmMigrate) return;
    
    setMigrating(true);
    try {
      const result = await migrateLocalStorageToFirestore(session.user.email);
      if (result.success) {
        alert(`Successfully migrated ${result.count} words!`);
        // Optional: Clear localStorage after migration
        // localStorage.removeItem("words");
      }
    } catch (error) {
      alert("Migration failed. Please try again.");
    } finally {
      setMigrating(false);
    }
  };

  return (
    <main className="container mx-auto p-4">
      {/* Add this button at the top */}
      {localStorage.getItem("words") && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="mb-2 text-sm">
            You have words in local storage. Migrate them to the cloud for access on all devices!
          </p>
          <Button onClick={handleMigration} disabled={migrating}>
            {migrating ? "Migrating..." : "Migrate to Cloud"}
          </Button>
        </div>
      )}
      
      {/* Rest of your component */}
    </main>
  );
};
```

### 15. Test Your Implementation (10 minutes)

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Sign in with Google:**
   - Go to http://localhost:3000
   - Sign in with your Google account

3. **Test adding a word:**
   - Navigate to "Add New Word"
   - Add a word like "test"
   - Check Firebase Console → Firestore Database
   - You should see: `users/{your-email}/words/{auto-id}`

4. **Test real-time sync:**
   - Open the app in a second browser tab
   - Add a word in one tab
   - Watch it appear immediately in the other tab!

5. **Test deletion:**
   - Go to "All Words"
   - Delete a word
   - Verify it's removed from Firestore Console

6. **Test migration (if you have old data):**
   - If you have existing words in localStorage
   - Click "Migrate to Cloud" button
   - Verify all words appear in Firestore

### 16. Deploy to Production (Optional)

If deploying to Vercel:

1. Add environment variables in Vercel dashboard:
   - Settings → Environment Variables
   - Add all NEXT_PUBLIC_FIREBASE_* variables
   - Apply to Production, Preview, and Development

2. Deploy:
   ```bash
   git add .
   git commit -m "Add Firebase Firestore integration"
   git push origin main
   ```

3. Vercel will automatically deploy

## Troubleshooting

### Issue: "Permission denied" error

**Solution:**
- Check Firestore security rules
- Verify you're signed in
- Check that `session.user.email` matches Firestore path

### Issue: "Firebase not initialized"

**Solution:**
- Verify all environment variables are set in `.env.local`
- Restart dev server after adding environment variables
- Check for typos in variable names

### Issue: Data not syncing

**Solution:**
- Check browser console for errors
- Verify Firebase project is active
- Check network tab for failed requests
- Ensure Firestore API is enabled

### Issue: "No Firebase App" error

**Solution:**
```typescript
// Make sure you're importing from the correct file
import { db } from "@/lib/firebase";
```

### Issue: Can't see data in Firestore Console

**Solution:**
- Click "Data" tab in Firestore Database
- Navigate to the collections: users → {email} → words
- If no data appears, try adding a word through the app

## Monitoring Usage

1. **Check daily usage:**
   - Firebase Console → Firestore Database → Usage tab
   - Monitor reads, writes, and deletes

2. **Set up alerts:**
   - Firebase Console → Usage and billing
   - Create budget alert at $0 (free tier)
   - Get notified at 50%, 90%, 100%

3. **Expected usage for personal app:**
   - Daily writes: 10-50
   - Daily reads: 100-500
   - Storage: < 1 MB
   - **Result**: Well within free tier! ✅

## Data Structure in Firestore

After implementation, your data will look like this:

```
Firestore Database
└── users (collection)
    └── your-email@gmail.com (document)
        └── words (subcollection)
            ├── abc123def456 (document)
            │   ├── word: "hello"
            │   ├── translation: "Used as a greeting...\n你好"
            │   └── createdAt: Timestamp
            ├── xyz789uvw012 (document)
            │   ├── word: "world"
            │   ├── translation: "The earth...\n世界"
            │   └── createdAt: Timestamp
            └── ...
```

## Benefits You'll Get

✅ **Sync across devices** - Access your words on phone, tablet, laptop
✅ **No data loss** - Cloud backup protects against browser cache clearing
✅ **Real-time updates** - Changes appear instantly on all devices
✅ **User isolation** - Each user has their own private word collection
✅ **Free forever** - Stay within generous free tier limits
✅ **Zero maintenance** - Firebase handles all infrastructure

## Next Steps

After successful implementation:

1. **Remove localStorage dependency** - Once migration is complete
2. **Add offline support** - Firestore has built-in offline capabilities
3. **Add word sharing** - Share vocabulary lists with friends
4. **Add study statistics** - Track practice sessions in Firestore
5. **Add word categories** - Organize words by topic/difficulty

## Cost Estimate

For a personal app with daily usage:

- **Users**: 1-5
- **Words**: 100-1000
- **Daily reads**: ~100
- **Daily writes**: ~10
- **Monthly cost**: **$0** (well within free tier)

Even with 50 active users:
- **Daily reads**: ~5,000 (10% of free limit)
- **Daily writes**: ~500 (2.5% of free limit)
- **Monthly cost**: **$0**

## Summary

You now have:
- ✅ Cloud-based word storage
- ✅ Real-time synchronization
- ✅ Cross-device access
- ✅ Automatic backups
- ✅ User authentication & authorization
- ✅ Zero monthly cost (free tier)

**Total setup time**: ~45 minutes
**Monthly cost**: $0 (free tier)
**Benefit**: Professional cloud-based vocabulary app! 🎉
