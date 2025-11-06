# Testing Guide for Firestore Integration

This guide documents all fixes for the Firestore integration issues and how to test them.

## Issues Fixed

### Issue 1: Word Deletion Not Updating UI ✅ FIXED

**Problem**: When deleting a word from the all-words page, the word was removed from Firestore but the UI didn't update immediately.

**Root Cause**: 
1. List items were using array index as `key` instead of the word itself
2. Component wasn't wrapped with MobX `observer()` HOC
3. Delete operation wasn't async-await properly

**Fix Applied**:
```typescript
// Before:
<li key={index} ...>
  <button onClick={() => deleteWord(word)}>🗑️</button>
</li>

// After:
<li key={word} ...>
  <button onClick={async () => {
    try {
      await deleteWord(word);
    } catch (error) {
      alert("Failed to delete word. Please try again.");
    }
  }}>🗑️</button>
</li>
```

Also wrapped component with observer:
```typescript
// Before:
const Home = () => { ... };

// After:
import { observer } from "mobx-react-lite";
const Home = observer(() => { ... });
```

### Issue 2: Annoying Success Alert ✅ FIXED

**Problem**: Every time a word was added, an alert popped up saying "Successfully added 'word' to Firestore!"

**Fix Applied**:
```typescript
// Before:
await addWord(word, combinedTranslation);
alert(`Successfully added "${word}" to Firestore!`);
clear();

// After:
await addWord(word, combinedTranslation);
// Success - just clear the input, no alert needed
clear();
```

Now only errors show alerts.

## How to Test Locally

### Prerequisites

1. **Install dependencies**:
```bash
cd /home/runner/work/learning-english/learning-english
npm install
```

2. **Install Playwright** (for E2E tests):
```bash
npx playwright install
```

3. **Set up Firebase** (one-time):
   - Create `.env.local` with your Firebase config
   - Enable Anonymous Auth in Firebase Console
   - Set Firestore security rules

### Manual Testing

#### Test 1: Add Word (No Alert)

```bash
# Start dev server
npm run dev

# Open http://localhost:3000/add-word
# 1. Sign in with Google
# 2. Enter a word (e.g., "test")
# 3. Click "Add"
# Expected: Input clears, NO alert popup
# 4. Go to "View All Words"
# Expected: New word appears in list
```

#### Test 2: Delete Word (Immediate UI Update)

```bash
# Continue from above or refresh
# http://localhost:3000/all-words

# 1. Ensure you have at least one word
# 2. Click the 🗑️ button next to any word
# Expected: Word disappears from UI immediately
# 3. Check Firebase Console
# Expected: Word also deleted from Firestore
# 4. Refresh page
# Expected: Word still gone (persisted)
```

#### Test 3: Real-Time Sync

```bash
# Open two browser tabs/windows

# Tab 1: http://localhost:3000/all-words
# Tab 2: http://localhost:3000/add-word

# In Tab 2:
# 1. Add a new word
# Expected: Input clears, no alert

# In Tab 1:
# Expected: New word appears automatically (within 1-2 seconds)

# In Tab 1:
# 2. Delete a word
# Expected: Word disappears immediately

# In Tab 2 (navigate to all-words):
# Expected: Deleted word not shown
```

### Automated E2E Testing

#### Run All Tests

```bash
# Headless (CI mode)
npm run test:e2e

# With UI (interactive)
npm run test:e2e:ui

# Headed (see browser)
npm run test:e2e:headed
```

#### Run Specific Tests

```bash
# Only integration tests
npx playwright test e2e/firestore-integration.spec.ts

# Only one test
npx playwright test e2e/firestore-integration.spec.ts -g "should not show success alert"
```

#### View Test Results

```bash
# Open HTML report
npx playwright show-report

# Debug failed test
npx playwright test --debug
```

### Test Coverage

The E2E tests verify:

- ✅ **Page Loading**: All pages load without errors
- ✅ **UI Components**: Input fields, buttons, lists render correctly  
- ✅ **Navigation**: Links work between pages
- ✅ **Loading States**: Loading indicators appear/disappear properly
- ✅ **React Keys**: List items use stable keys (word, not index)
- ✅ **Delete Buttons**: Present and clickable
- ✅ **No Alerts**: Word addition doesn't show success alerts

### Verification Checklist

After applying fixes, verify:

- [ ] `npm install` completes successfully
- [ ] `npm run dev` starts without errors
- [ ] Can sign in with Google OAuth
- [ ] Adding a word:
  - [ ] No success alert popup
  - [ ] Input clears after add
  - [ ] Word appears in all-words page
  - [ ] Word saved to Firestore (check console)
- [ ] Deleting a word:
  - [ ] Word disappears from UI immediately
  - [ ] No page refresh needed
  - [ ] Word deleted from Firestore (check console)
  - [ ] Refresh page - word still gone
- [ ] Real-time sync:
  - [ ] Add word in one tab, appears in another
  - [ ] Delete word in one tab, disappears in another
- [ ] E2E tests:
  - [ ] `npm run test:e2e` passes
  - [ ] Test report shows all green

## Technical Details

### MobX Observer Pattern

The `observer()` HOC from `mobx-react-lite` makes React components reactive to MobX observables:

```typescript
import { observer } from "mobx-react-lite";

// Wrapping with observer makes the component re-render
// when words.wordTranslations changes
const Home = observer(() => {
  const { words } = useFirestoreWords();
  
  // This Map is observable - changes trigger re-render
  const allWords = words.allWords;
  
  return (
    <ul>
      {Array.from(allWords.entries()).map(([word, translation]) => (
        <li key={word}>
          {word}: {translation}
        </li>
      ))}
    </ul>
  );
});
```

### Firestore Real-Time Listener

The `useFirestoreWords` hook sets up a real-time listener:

```typescript
const unsubscribe = onSnapshot(wordsCollection, (snapshot) => {
  const wordsData: [string, string][] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    wordsData.push([data.word, data.translation]);
  });
  // This updates the observable, triggering re-render
  words.setWords(wordsData);
});
```

When a word is added/deleted in Firestore, the listener fires and updates the MobX store, which triggers a re-render in all observer components.

### React Key Best Practice

Using stable, unique keys ensures React properly reconciles changes:

```typescript
// ❌ Bad: Index can change when items are removed
{items.map((item, index) => <li key={index}>{item}</li>)}

// ✅ Good: Unique identifier stays stable
{items.map((item) => <li key={item.id}>{item}</li>)}
```

## Troubleshooting

### Tests Fail with "Page not found"

Make sure dev server is running:
```bash
npm run dev
```

### Tests Pass But Changes Don't Work Manually

The E2E tests are UI-only and don't require authentication. Manual testing requires:
1. Firebase config in `.env.local`
2. Anonymous Auth enabled
3. Firestore rules set
4. Google OAuth sign-in

### Word Deletion Still Not Updating

Check browser console for errors:
```javascript
// In browser console:
console.log("MobX observer working?");
```

Verify the component is wrapped with `observer()`.

### Real-Time Sync Not Working

1. Check Firebase Console - is data actually being written?
2. Check browser console for Firestore errors
3. Verify Anonymous Auth is enabled
4. Verify security rules allow read/write

## Next Steps

1. ✅ Apply fixes (done in this commit)
2. ✅ Add E2E tests (done in this commit)
3. Run manual tests to verify
4. Run E2E tests: `npm run test:e2e`
5. Deploy to Vercel with environment variables
6. Test in production

## Files Changed

1. `src/app/all-words/page.tsx`:
   - Added `observer()` wrapper
   - Changed key from `index` to `word`
   - Made delete operation async-await

2. `src/app/add-word/page.tsx`:
   - Removed success alert
   - Kept error alerts

3. `package.json`:
   - Added `@playwright/test`
   - Added test scripts

4. `playwright.config.ts` (new):
   - Playwright configuration

5. `e2e/firestore-integration.spec.ts` (new):
   - E2E tests for Firestore features

6. `e2e/README.md` (new):
   - E2E testing guide

7. `docs/TESTING_GUIDE.md` (this file):
   - Comprehensive testing documentation

## Summary

Both issues are fixed:
- ✅ Word deletion now updates UI immediately
- ✅ Word addition no longer shows annoying alerts
- ✅ E2E tests added for automated verification
- ✅ Testing guide created for manual verification

Ready to test and deploy! 🚀
