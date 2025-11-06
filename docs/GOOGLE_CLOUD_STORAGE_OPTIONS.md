# Google Cloud Storage Options for Learning English

This document provides recommendations for saving data in Google Cloud for the Learning English application. All options include free tier availability suitable for personal projects.

## Table of Contents

- [Overview](#overview)
- [Recommended Options](#recommended-options)
- [Option 1: Firebase Firestore (Recommended)](#option-1-firebase-firestore-recommended)
- [Option 2: Google Cloud Storage](#option-2-google-cloud-storage)
- [Option 3: Cloud SQL](#option-3-cloud-sql)
- [Comparison Table](#comparison-table)
- [Migration Guide](#migration-guide)

## Overview

Currently, the Learning English app stores word data in browser localStorage. While this works for a single device, it has limitations:

- **No sync across devices**: Data doesn't transfer between browsers/devices
- **Storage limits**: Limited to ~5-10MB
- **No backup**: Data lost if browser cache is cleared
- **No sharing**: Can't share vocabulary lists with others

Moving to Google Cloud storage provides:
- Cross-device synchronization
- Unlimited storage (within free tier limits)
- Automatic backups
- User-specific data isolation
- Scalability for future features

## Recommended Options

### Quick Recommendation

**For this project, I recommend Firebase Firestore (Option 1)** because:
- ✅ Generous free tier (1GB storage, 50K reads/day, 20K writes/day)
- ✅ Easy to integrate with existing Google OAuth setup
- ✅ Real-time synchronization across devices
- ✅ NoSQL structure matches current data model
- ✅ Minimal backend code required
- ✅ Built-in security rules
- ✅ Excellent documentation and community support

## Option 1: Firebase Firestore (Recommended)

### What is Firestore?

Firebase Firestore is a NoSQL cloud database that automatically syncs data across all clients in real-time. It's perfect for web and mobile applications.

### Free Tier Limits

- **Storage**: 1 GB
- **Reads**: 50,000 per day
- **Writes**: 20,000 per day
- **Deletes**: 20,000 per day
- **Network egress**: 10 GB per month

**For a personal vocabulary app**: These limits are more than sufficient. Even with 100 daily active users, you'd stay well within the free tier.

### Pros

✅ Real-time sync across devices
✅ Offline support built-in
✅ Simple integration with Next.js
✅ Automatic scaling
✅ Built-in security rules
✅ No server management needed
✅ Integrates with existing Google OAuth

### Cons

❌ Limited querying compared to SQL
❌ Costs can increase with scale (though free tier is generous)
❌ Requires learning Firestore data modeling

### Setup Instructions

#### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `learning-english` (or your preferred name)
4. (Optional) Enable Google Analytics - recommended for tracking usage
5. Click **"Create project"**
6. Wait for project creation (30-60 seconds)

#### Step 2: Enable Firestore Database

1. In Firebase Console, click **"Firestore Database"** in left sidebar
2. Click **"Create database"**
3. Select **"Start in production mode"** (we'll add security rules later)
4. Choose database location: **"us-central"** or closest to your users
5. Click **"Enable"**

#### Step 3: Register Web App

1. In Firebase Console, click the **gear icon** → **Project settings**
2. Scroll to **"Your apps"** section
3. Click the **web icon** (`</>`)
4. Register app:
   - App nickname: `learning-english-web`
   - ✅ Check **"Also set up Firebase Hosting"** (optional)
5. Click **"Register app"**
6. Copy the Firebase configuration object - you'll need this later

Example config:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "learning-english-xxxxx.firebaseapp.com",
  projectId: "learning-english-xxxxx",
  storageBucket: "learning-english-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
};
```

#### Step 4: Install Firebase SDK

In your project directory:

```bash
npm install firebase
```

#### Step 5: Configure Firebase in Your App

Create a new file: `src/lib/firebase.ts`

```typescript
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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

// Initialize Firestore
export const db = getFirestore(app);
```

#### Step 6: Add Environment Variables

Update `.env.local`:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

Update `.env.example`:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

#### Step 7: Set Up Security Rules

In Firebase Console, go to **Firestore Database** → **Rules** tab.

Add these security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    // Using email as document ID, so we check against the email claim
    match /users/{userId}/words/{wordId} {
      allow read, write: if request.auth != null && request.auth.token.email == userId;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Click **"Publish"** to save the rules.

#### Step 8: Update the useWords Hook

Create a new file: `src/hooks/useFirestoreWords.ts`

```typescript
import { useEffect, useState } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, where, getDocs } from "firebase/firestore";
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
    return this.userInputs.size === randomWords.length && 
           Array.from(this.userInputs.entries()).every(([word, value]) => word === value);
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

  useEffect(() => {
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }

    const userId = session.user.email;
    const wordsCollection = collection(db, "users", userId, "words");

    // Real-time listener
    const unsubscribe = onSnapshot(wordsCollection, (snapshot) => {
      const wordsData: [string, string][] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        wordsData.push([data.word, data.translation]);
      });
      words.setWords(wordsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [session?.user?.email]);

  const addWord = async (word: string, translation: string) => {
    if (!session?.user?.email) {
      throw new Error("User not authenticated");
    }

    const userId = session.user.email;
    const wordsCollection = collection(db, "users", userId, "words");
    
    await addDoc(wordsCollection, {
      word,
      translation,
      createdAt: new Date(),
    });
  };

  const deleteWord = async (word: string) => {
    if (!session?.user?.email) {
      throw new Error("User not authenticated");
    }

    const userId = session.user.email;
    const wordsCollection = collection(db, "users", userId, "words");
    
    // Find and delete the document
    const q = query(wordsCollection, where("word", "==", word));
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map((document) =>
      deleteDoc(doc(db, "users", userId, "words", document.id))
    );
    await Promise.all(deletePromises);
  };

  const removeAllWords = async () => {
    if (!session?.user?.email) {
      throw new Error("User not authenticated");
    }

    const userId = session.user.email;
    const wordsCollection = collection(db, "users", userId, "words");
    
    const querySnapshot = await getDocs(wordsCollection);
    
    querySnapshot.forEach(async (document) => {
      await deleteDoc(doc(db, "users", userId, "words", document.id));
    });
  };

  return { words, addWord, deleteWord, removeAllWords, loading };
};
```

#### Step 9: Update Components to Use Firestore

Update your components to use the new `useFirestoreWords` hook instead of `useWords`.

Example for `src/app/home/page.tsx`:

```typescript
"use client";

import { useFirestoreWords } from "@/hooks/useFirestoreWords";
import { Input, Button } from "@/components/ui";
// ... rest of imports

const Home = () => {
  const { words, loading } = useFirestoreWords();
  
  if (loading) {
    return <div>Loading words...</div>;
  }
  
  // ... rest of component
};
```

#### Step 10: Test Your Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Sign in with Google OAuth
3. Add a new word
4. Check Firestore Console to see the data
5. Open the app in another browser/device
6. Sign in with the same Google account
7. Verify words sync automatically

### Data Structure in Firestore

```
users (collection)
  └── {userEmail} (document)
      └── words (subcollection)
          ├── {autoId1} (document)
          │   ├── word: "hello"
          │   ├── translation: "Used as a greeting...\n你好"
          │   └── createdAt: Timestamp
          ├── {autoId2} (document)
          │   ├── word: "world"
          │   ├── translation: "The earth...\n世界"
          │   └── createdAt: Timestamp
          └── ...
```

### Monitoring Usage

1. Go to Firebase Console → **Firestore Database** → **Usage** tab
2. Monitor:
   - Document reads
   - Document writes
   - Storage size
3. Set up budget alerts in **Firebase Console** → **Usage and billing** → **Budget alerts**

### Cost Estimates

For a personal app with 10 users:
- Daily writes: ~100 (10 users × 10 words added per day)
- Daily reads: ~1,000 (10 users × 100 reads per day)
- Storage: < 1 MB

**Result**: Well within free tier limits! 🎉

## Option 2: Google Cloud Storage

### What is Cloud Storage?

Google Cloud Storage is object storage for any amount of data. It's like storing files in the cloud - you can store JSON files, images, etc.

### Free Tier Limits

- **Storage**: 5 GB per month
- **Class A Operations**: 5,000 per month (writes)
- **Class B Operations**: 50,000 per month (reads)
- **Network egress**: 1 GB per month (from North America)

### Pros

✅ Simple file-based storage
✅ Good for storing backups
✅ Can store any file type
✅ Pay only for what you use

### Cons

❌ Requires backend API to manage access
❌ No real-time sync
❌ More complex security setup
❌ Need to implement your own sync logic

### When to Use

- Storing backup files
- Storing user-uploaded content (images, audio)
- Exporting vocabulary lists as JSON/CSV files

### Setup Instructions

#### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Project name: `learning-english`
4. Click **"Create"**
5. Wait for project creation

#### Step 2: Enable Cloud Storage API

1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Cloud Storage"
3. Click **"Cloud Storage API"**
4. Click **"Enable"**

#### Step 3: Create a Storage Bucket

1. Go to **Cloud Storage** → **Buckets**
2. Click **"Create bucket"**
3. Bucket name: `learning-english-words-{random}` (must be globally unique)
4. Location type: **Region**
5. Location: **us-central1** (or closest to you)
6. Storage class: **Standard**
7. Access control: **Fine-grained**
8. Protection tools: Leave defaults
9. Click **"Create"**

#### Step 4: Set Up Service Account

1. Go to **IAM & Admin** → **Service Accounts**
2. Click **"Create service account"**
3. Service account name: `learning-english-storage`
4. Service account description: "Access to Cloud Storage for words"
5. Click **"Create and continue"**
6. Grant role: **Storage Object Admin**
7. Click **"Continue"** → **"Done"**
8. Click on the service account you just created
9. Go to **Keys** tab
10. Click **"Add key"** → **"Create new key"**
11. Key type: **JSON**
12. Click **"Create"**
13. Save the JSON file securely (DO NOT commit to git!)

#### Step 5: Install Google Cloud Storage SDK

```bash
npm install @google-cloud/storage
```

#### Step 6: Create Server API Route

Create `src/app/api/words/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

const bucketName = process.env.GCP_BUCKET_NAME || "";
const bucket = storage.bucket(bucketName);

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fileName = `${session.user.email}/words.json`;
  const file = bucket.file(fileName);

  try {
    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json({ words: [] });
    }

    const [contents] = await file.download();
    const words = JSON.parse(contents.toString());
    return NextResponse.json({ words });
  } catch (error) {
    console.error("Error reading words:", error);
    return NextResponse.json({ error: "Failed to read words" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { words } = await request.json();
  const fileName = `${session.user.email}/words.json`;
  const file = bucket.file(fileName);

  try {
    await file.save(JSON.stringify(words), {
      contentType: "application/json",
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving words:", error);
    return NextResponse.json({ error: "Failed to save words" }, { status: 500 });
  }
}
```

#### Step 7: Add Environment Variables

Update `.env.local`:

```bash
# Google Cloud Storage
GCP_PROJECT_ID=your-project-id
GCP_BUCKET_NAME=learning-english-words-xxxxx
GCP_CLIENT_EMAIL=learning-english-storage@your-project.iam.gserviceaccount.com
GCP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

**Important**: Keep your service account key secure! Never commit it to git!

#### Step 8: Update useWords Hook

Create `src/hooks/useCloudStorageWords.ts`:

```typescript
import { useEffect, useState } from "react";
import { makeAutoObservable } from "mobx";

// ... (same Words class as before)

export const useCloudStorageWords = () => {
  const [loading, setLoading] = useState(true);

  // Load words on mount
  useEffect(() => {
    const loadWords = async () => {
      try {
        const response = await fetch("/api/words");
        if (response.ok) {
          const data = await response.json();
          words.setWords(data.words || []);
        }
      } catch (error) {
        console.error("Failed to load words:", error);
      } finally {
        setLoading(false);
      }
    };

    loadWords();
  }, []);

  const saveToCloud = async () => {
    try {
      await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          words: Array.from(words.wordTranslations.entries()),
        }),
      });
    } catch (error) {
      console.error("Failed to save words:", error);
    }
  };

  const addWord = async (word: string, translation: string) => {
    words.addWord(word, translation);
    await saveToCloud();
  };

  const deleteWord = async (word: string) => {
    words.deleteWord(word);
    await saveToCloud();
  };

  const removeAllWords = async () => {
    words.removeAllWords();
    await saveToCloud();
  };

  return { words, addWord, deleteWord, removeAllWords, loading };
};
```

### Security Considerations

- Never expose service account keys in client code
- Use server-side API routes for all Cloud Storage operations
- Implement proper authentication checks
- Consider using signed URLs for direct uploads

## Option 3: Cloud SQL

### What is Cloud SQL?

Cloud SQL is a fully managed relational database service (PostgreSQL, MySQL, or SQL Server).

### Free Tier

⚠️ **Note**: Cloud SQL does **NOT** have a free tier. The minimum cost is ~$9/month for the smallest instance.

However, Google offers:
- **$300 credit** for new accounts (valid for 90 days)
- Can use credits for testing

### Pros

✅ Full SQL database capabilities
✅ Complex queries and relationships
✅ ACID compliance
✅ Automatic backups
✅ High availability

### Cons

❌ **NO FREE TIER** - Minimum $9/month
❌ More complex setup
❌ Requires backend API
❌ Overkill for simple key-value storage
❌ Need to manage connections

### When to Use

- Need complex queries and relationships
- Building a larger application with multiple data types
- Require ACID transactions
- Have budget for hosting

### Why Not Recommended for This Project

For a personal vocabulary app:
1. Cost: Minimum $9/month when Firestore is free
2. Complexity: Requires more setup and maintenance
3. Overkill: Simple word storage doesn't need SQL capabilities

If you still want to use Cloud SQL, the setup is similar to traditional database hosting (connection strings, migrations, ORM setup).

## Comparison Table

| Feature | Firestore (✅ Recommended) | Cloud Storage | Cloud SQL |
|---------|---------------------------|---------------|-----------|
| **Free Tier** | ✅ Yes (1GB, 50K reads/day) | ✅ Yes (5GB, 5K writes/month) | ❌ No (~$9/month) |
| **Setup Difficulty** | ⭐ Easy | ⭐⭐ Medium | ⭐⭐⭐ Hard |
| **Real-time Sync** | ✅ Yes | ❌ No | ❌ No |
| **Offline Support** | ✅ Yes | ❌ No | ❌ No |
| **Backend Required** | ❌ No | ✅ Yes | ✅ Yes |
| **Best For** | Real-time apps, mobile | File storage | Complex queries |
| **Learning Curve** | Low | Medium | High |
| **Scalability** | Auto | Auto | Manual |
| **Data Model** | NoSQL | Files | SQL |

## Migration Guide

### Migrating from localStorage to Firestore

Here's a migration script to move existing localStorage data to Firestore:

Create `src/utils/migrateToFirestore.ts`:

```typescript
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const migrateLocalStorageToFirestore = async (userId: string) => {
  try {
    // Get data from localStorage
    const storedWords = localStorage.getItem("words");
    if (!storedWords) {
      console.log("No words to migrate");
      return;
    }

    const words: [string, string][] = JSON.parse(storedWords);
    const wordsCollection = collection(db, "users", userId, "words");

    // Upload each word to Firestore
    for (const [word, translation] of words) {
      await addDoc(wordsCollection, {
        word,
        translation,
        createdAt: new Date(),
      });
    }

    console.log(`Successfully migrated ${words.length} words`);
    
    // Optional: Clear localStorage after successful migration
    // localStorage.removeItem("words");
  } catch (error) {
    console.error("Migration failed:", error);
  }
};
```

Usage in your component:

```typescript
import { migrateLocalStorageToFirestore } from "@/utils/migrateToFirestore";
import { useSession } from "next-auth/react";

const MyComponent = () => {
  const { data: session } = useSession();
  
  const handleMigration = async () => {
    if (session?.user?.email) {
      await migrateLocalStorageToFirestore(session.user.email);
      alert("Migration complete!");
    }
  };

  return (
    <button onClick={handleMigration}>
      Migrate localStorage to Cloud
    </button>
  );
};
```

## Next Steps

1. **Choose your option**: I recommend Firestore (Option 1)
2. **Follow the setup guide** for your chosen option
3. **Test with development environment** first
4. **Migrate existing data** from localStorage
5. **Deploy to production**

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-model)
- [Cloud Storage Documentation](https://cloud.google.com/storage/docs)
- [Next.js + Firebase Tutorial](https://firebase.google.com/docs/web/setup)

## Support

If you encounter issues:
1. Check Firebase Console for errors
2. Review security rules
3. Verify environment variables are set correctly
4. Check browser console for errors
5. Test with Firebase Emulator for local development

## Cost Monitoring

Set up billing alerts to stay within free tier:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Billing** → **Budgets & alerts**
3. Click **"Create budget"**
4. Set budget to $0 (since you're using free tier)
5. Set alert threshold at 50%, 90%, and 100%
6. Add your email for notifications

This ensures you'll be notified if you accidentally exceed the free tier.
