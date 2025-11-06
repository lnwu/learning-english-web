# Local Testing and Vercel Deployment Guide

This guide shows you how to test Firebase Firestore integration locally and deploy to Vercel with your Firebase configuration.

## Prerequisites

- Firebase project created (learning-english-477407)
- Firebase configuration copied
- Node.js and npm installed
- Git repository connected to Vercel (or ready to deploy)

## Part 1: Local Testing Setup

### Step 1: Install Dependencies

```bash
cd /path/to/learning-english
npm install
```

This will install the new `firebase` package (v11.0.2) added to package.json.

### Step 2: Create Local Environment File

Create a `.env.local` file in the root of your project:

```bash
# Copy the example file
cp .env.example .env.local
```

### Step 3: Add Your Firebase Configuration

Edit `.env.local` and add your Firebase credentials:

```bash
# NextAuth Configuration
AUTH_SECRET=your-auth-secret-here
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBLrP7aHXPxPgVywtRje2IA4vgW9YJABIs
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=learning-english-477407.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=learning-english-477407
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=learning-english-477407.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=215741399231
NEXT_PUBLIC_FIREBASE_APP_ID=1:215741399231:web:8dd8a4d41adfb5c761860a
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-4GQEGC94C2
```

**⚠️ Important**: 
- Never commit `.env.local` to git (it's already in .gitignore)
- Keep your API keys secure
- The `.env.example` file shows the structure but should NOT contain real values

### Step 4: Set Up Firestore Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **learning-english-477407**
3. Click **Firestore Database** in the left sidebar
4. Click **Rules** tab
5. Replace the rules with:

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

6. Click **Publish**

### Step 5: Start Development Server

```bash
npm run dev
```

The app will start at: http://localhost:3000

### Step 6: Test Locally

#### Test 1: Sign In
1. Open http://localhost:3000
2. Click "Sign in with Google"
3. Verify you can sign in successfully

#### Test 2: Check Firestore Connection
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any Firebase-related errors
4. If you see "Firebase initialized successfully" (or no errors), connection is good

#### Test 3: Add a Word
1. Navigate to "Add New Word"
2. Add a test word (e.g., "test")
3. Check browser console for errors
4. Go to Firebase Console → Firestore Database
5. Navigate to: `users` → `{your-email}` → `words`
6. Verify the word appears

#### Test 4: Real-time Sync
1. Keep the app open in one browser tab
2. Open the same app in another tab (or incognito window)
3. Sign in with the same Google account
4. Add a word in one tab
5. Watch it appear instantly in the other tab
6. ✅ If it appears, real-time sync is working!

#### Test 5: Migration (if you have localStorage data)
1. If you already have words in localStorage, go to "All Words"
2. You should see a blue banner: "Migrate to Cloud Storage"
3. Click "Migrate to Cloud"
4. Wait for success message
5. Verify words appear in Firebase Console

### Troubleshooting Local Testing

**Issue: "Firebase config not found" error**
- Check `.env.local` file exists
- Verify all `NEXT_PUBLIC_FIREBASE_*` variables are set
- Restart dev server: Stop (Ctrl+C) and run `npm run dev` again

**Issue: "Permission denied" errors**
- Check Firestore security rules are published
- Verify you're signed in with Google OAuth
- Check browser console for specific error messages

**Issue: Words not syncing**
- Check internet connection
- Verify Firebase project is active in console
- Check Network tab in DevTools for failed requests

## Part 2: Vercel Deployment

### Method A: Deploy via Vercel Dashboard (Recommended)

#### Step 1: Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `lnwu/learning-english`
4. Click **"Import"**

#### Step 2: Add Environment Variables

Before deploying, add your environment variables:

1. In the import screen, click **"Environment Variables"**
2. Add each variable one by one:

**NextAuth Variables:**
```
AUTH_SECRET = your-auth-secret-here
AUTH_GOOGLE_ID = your-google-client-id
AUTH_GOOGLE_SECRET = your-google-client-secret
```

**Firebase Variables:**
```
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyBLrP7aHXPxPgVywtRje2IA4vgW9YJABIs
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = learning-english-477407.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = learning-english-477407
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = learning-english-477407.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 215741399231
NEXT_PUBLIC_FIREBASE_APP_ID = 1:215741399231:web:8dd8a4d41adfb5c761860a
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = G-4GQEGC94C2
```

3. For each variable, select which environments to apply to:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. Click **"Deploy"**

#### Step 3: Wait for Deployment

- First deployment takes 2-5 minutes
- Vercel will show build logs
- Wait for "Deployment Ready" message

#### Step 4: Test Production Deployment

1. Click on the deployment URL (e.g., `learning-english-xyz.vercel.app`)
2. Test signing in with Google
3. Test adding a word
4. Verify it appears in Firebase Console
5. Test on mobile device to verify real-time sync

### Method B: Add Variables to Existing Project

If your project is already deployed:

#### Step 1: Go to Project Settings

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **learning-english** project
3. Click **Settings**
4. Click **Environment Variables** in the left sidebar

#### Step 2: Add Firebase Variables

Click **"Add New"** for each variable:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyBLrP7aHXPxPgVywtRje2IA4vgW9YJABIs` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `learning-english-477407.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `learning-english-477407` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `learning-english-477407.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `215741399231` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:215741399231:web:8dd8a4d41adfb5c761860a` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-4GQEGC94C2` |

For each variable:
- Select environments: Production, Preview, Development
- Click **"Save"**

#### Step 3: Redeploy

After adding variables, you need to redeploy:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **"..."** menu
4. Click **"Redeploy"**
5. Wait for deployment to complete

### Method C: Deploy via CLI

If you have Vercel CLI installed:

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Set environment variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
# Enter value: AIzaSyBLrP7aHXPxPgVywtRje2IA4vgW9YJABIs
# Select: Production, Preview, Development

# Repeat for each variable...

# Deploy
vercel --prod
```

## Part 3: Verification Checklist

After deployment, verify everything works:

### Production Checklist

- [ ] App loads at Vercel URL
- [ ] Google OAuth sign-in works
- [ ] Can add words
- [ ] Words appear in Firebase Console
- [ ] Words sync across devices in real-time
- [ ] Can delete words
- [ ] Migration button works (if localStorage data exists)
- [ ] No errors in browser console
- [ ] Works on mobile devices

### Testing on Multiple Devices

1. **Desktop Browser**
   - Sign in and add a word
   - Keep the tab open

2. **Mobile Device**
   - Open the Vercel URL
   - Sign in with same Google account
   - Verify the word from desktop appears
   - Add a new word on mobile

3. **Back to Desktop**
   - Check if the mobile word appears automatically
   - ✅ Real-time sync confirmed!

## Part 4: Security Best Practices

### Environment Variables

✅ **Do:**
- Use `.env.local` for local development
- Add to `.gitignore` (already done)
- Use Vercel dashboard for production
- Keep backups of your credentials securely

❌ **Don't:**
- Commit `.env.local` to git
- Share credentials publicly
- Use same secrets across projects
- Store credentials in code

### Firebase Security

Your current security rules are correct:
```javascript
allow read, write: if request.auth != null && request.auth.token.email == userId;
```

This ensures:
- Users must be authenticated (Google OAuth)
- Users can only access their own data
- Email is used as the user identifier

### API Key Security

**Note**: Firebase API keys in `NEXT_PUBLIC_*` variables are safe to expose in client-side code because:
- They're meant to identify your Firebase project
- Security is enforced by Firestore security rules
- They can't be used to access data without authentication

However, keep your `AUTH_SECRET` and `AUTH_GOOGLE_SECRET` private!

## Part 5: Common Issues and Solutions

### Issue: "Module not found: firebase"

**Solution:**
```bash
npm install firebase
npm run dev
```

### Issue: Environment variables not working in Vercel

**Solution:**
1. Check variable names match exactly (case-sensitive)
2. Verify they start with `NEXT_PUBLIC_` for client-side use
3. Redeploy after adding variables
4. Check Vercel logs for specific errors

### Issue: Firestore permission denied

**Solution:**
1. Verify security rules are published
2. Check you're signed in with Google
3. Verify email is correct in Firestore path
4. Check browser console for specific error

### Issue: Real-time sync not working

**Solution:**
1. Check internet connection
2. Verify Firebase project is active
3. Check browser console for WebSocket errors
4. Try refreshing the page

## Part 6: Monitoring and Debugging

### Check Firestore Usage

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **learning-english-477407**
3. Click **Firestore Database**
4. Click **Usage** tab
5. Monitor:
   - Document reads
   - Document writes
   - Storage size

### Check Vercel Logs

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click **Logs** tab
4. Filter by:
   - Errors
   - Warnings
   - Specific time range

### Browser DevTools

1. Open DevTools (F12)
2. **Console Tab**: Check for errors
3. **Network Tab**: Monitor Firebase requests
4. **Application Tab**: Check localStorage

## Summary

### Quick Start Commands

**Local Development:**
```bash
# 1. Install dependencies
npm install

# 2. Create .env.local with your Firebase config

# 3. Start dev server
npm run dev

# 4. Open http://localhost:3000
```

**Vercel Deployment:**
1. Add Firebase environment variables in Vercel dashboard
2. Deploy (or redeploy if already deployed)
3. Test production URL
4. Verify real-time sync works

### What You've Achieved

✅ Firebase Firestore integration
✅ Real-time cloud synchronization
✅ Cross-device word syncing
✅ localStorage migration tool
✅ Production-ready deployment
✅ Secure user data isolation

### Next Steps

1. Test thoroughly in local environment
2. Deploy to Vercel with environment variables
3. Test on multiple devices
4. Migrate existing localStorage data (if any)
5. Enjoy cloud-synced vocabulary learning! 🎉

## Need Help?

- **Firebase Console**: https://console.firebase.google.com/
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Firebase Docs**: https://firebase.google.com/docs/firestore
- **Next.js Docs**: https://nextjs.org/docs
- **Check the MIGRATION_GUIDE.md** for detailed migration instructions
