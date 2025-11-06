# E2E Testing Guide

This directory contains end-to-end tests for the Learning English application using Playwright.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

### Run all tests (headless):
```bash
npm run test:e2e
```

### Run tests with UI (interactive):
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser):
```bash
npm run test:e2e:headed
```

### Run specific test file:
```bash
npx playwright test e2e/firestore-integration.spec.ts
```

## Test Structure

### `firestore-integration.spec.ts`
Tests for Firebase Firestore integration including:
- Word addition without annoying success alerts
- Word deletion with immediate UI updates
- Component reactivity with MobX
- Loading states
- Navigation

## Important Notes

### Authentication Required Tests

Some tests require actual Firebase authentication:
- Adding words to Firestore
- Deleting words from Firestore
- Real-time sync between tabs

These tests are currently UI-only. To test full functionality:

1. **Set up .env.local** with Firebase config
2. **Enable Anonymous Auth** in Firebase Console
3. **Set Firestore Security Rules**
4. **Sign in manually** before running tests

### Manual Testing Steps

For tests that require authentication:

```bash
# 1. Start the dev server
npm run dev

# 2. Open browser and sign in
# http://localhost:3000

# 3. Run tests in headed mode
npm run test:e2e:headed
```

## Test Coverage

Current tests verify:

- ✅ Pages load correctly
- ✅ UI components are visible
- ✅ Navigation works
- ✅ Loading states display
- ✅ Word list uses proper React keys
- ✅ Delete buttons are present
- ✅ No success alerts on word addition

Future tests (require auth setup):
- [ ] Add word and verify in Firestore
- [ ] Delete word and verify UI updates
- [ ] Real-time sync across browser tabs
- [ ] Migration from localStorage to Firestore

## Debugging Tests

### View test report:
```bash
npx playwright show-report
```

### Debug specific test:
```bash
npx playwright test --debug e2e/firestore-integration.spec.ts
```

### Record test:
```bash
npx playwright codegen http://localhost:3000
```

## CI/CD Integration

Tests can run in CI with:
```bash
npm run build
npm run test:e2e
```

Make sure to set environment variables in CI:
- `NEXT_PUBLIC_FIREBASE_*` (all 7 Firebase config vars)
- Firebase Anonymous Auth enabled
- Firestore rules configured
