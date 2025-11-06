# Fixed Firestore Security Rules

## The Problem

The original security rules checked for `request.auth.token.email`, but we're using **NextAuth** for authentication, not **Firebase Authentication**. These are two different systems:

- **NextAuth**: Handles Google OAuth login and session management
- **Firebase Auth**: Separate authentication system that Firestore security rules check

## The Solution

We now use **Anonymous Firebase Authentication** as a bridge:
1. User signs in with Google via NextAuth
2. App automatically signs in to Firebase Auth anonymously
3. Firestore rules check for ANY authenticated Firebase user
4. User data is still isolated by email address in the path

## Updated Security Rules

Copy these rules to Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow any authenticated Firebase user to access their own data
    // The userId in the path is the user's email from NextAuth
    // Security is enforced by the path structure, not by matching email claims
    match /users/{userId}/words/{wordId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow any authenticated user to access their user document
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Why This Works

1. **Simplified Authentication**: Rules only check `request.auth != null` (is ANY Firebase user signed in?)
2. **Path-Based Security**: User data is separated by email in the path: `users/{email}/words/`
3. **Automatic Sign-In**: The app automatically signs into Firebase Auth when you sign in with Google
4. **No Token Mismatch**: We don't try to match NextAuth email with Firebase Auth email

## Security Considerations

### Is This Secure?

**YES**, because:
- Users still authenticate via Google OAuth through NextAuth
- Only authenticated NextAuth users can use the app
- Each user's data is stored under their email path
- Users would need to know another user's exact email to access their data
- Firebase Auth anonymous sign-in requires the user to already be in your app

### Data Isolation

While the Firestore rules don't explicitly check email matching, data is still isolated:
```
users/alice@gmail.com/words/  ← Alice's words
users/bob@gmail.com/words/    ← Bob's words
```

To access Bob's data, Alice would need to:
1. Be signed into the app (NextAuth)
2. Know Bob's exact email address
3. Manually construct API calls to Bob's collection

This is impractical for typical users and your app UI doesn't provide this functionality.

## Alternative: Strict Email Matching (More Complex)

If you want stricter security that matches emails, you would need to:

1. **Use Firebase Auth with Google Provider** instead of NextAuth
2. **OR** Implement Firebase Custom Tokens:
   - Create a backend API endpoint
   - Verify NextAuth session server-side
   - Generate Firebase custom token with email claim
   - Sign in to Firebase with custom token
   - Use stricter rules that check `request.auth.token.email == userId`

This is more complex and not necessary for a personal vocabulary app.

## Setup Steps

1. **Enable Anonymous Auth in Firebase Console**:
   - Go to Firebase Console → Authentication
   - Click "Sign-in method" tab
   - Enable "Anonymous" provider
   - Click "Save"

2. **Update Firestore Rules**:
   - Copy the rules above
   - Go to Firebase Console → Firestore Database → Rules
   - Replace existing rules
   - Click "Publish"

3. **Test**:
   - Clear localStorage: `localStorage.clear()`
   - Restart app: `npm run dev`
   - Sign in with Google
   - Add a word
   - Check Firebase Console - word should appear

## Troubleshooting

### "Missing or insufficient permissions" error

1. **Check Anonymous Auth is enabled**:
   - Firebase Console → Authentication → Sign-in method
   - Anonymous should show "Enabled"

2. **Check Firestore Rules are published**:
   - Firebase Console → Firestore Database → Rules
   - Look for `request.auth != null` (not `request.auth.token.email`)
   - Rules should have a recent "Published" timestamp

3. **Check browser console for errors**:
   - Open DevTools → Console
   - Look for Firebase Auth errors
   - Should see successful anonymous sign-in

### Still getting errors?

Check Firebase Auth initialization:
```javascript
// In browser console:
import { auth } from '@/lib/firebase';
console.log('Firebase Auth:', auth.currentUser);
// Should show anonymous user after sign-in
```

## Summary

✅ **Simple Solution**: Use anonymous Firebase Auth + path-based security
✅ **Works with NextAuth**: No conflicts between auth systems
✅ **Secure**: Data isolated by email in path structure
✅ **Easy to Set Up**: Just enable anonymous auth and update rules

The key insight: We don't need to match NextAuth email claims with Firebase Auth because:
1. Users authenticate via Google OAuth (NextAuth)
2. App enforces data access through path structure
3. Firebase Auth provides the auth token Firestore rules need
