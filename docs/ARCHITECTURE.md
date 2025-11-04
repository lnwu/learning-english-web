# Architecture Guide

This document explains the architecture and design patterns used in the Learning English application.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Application Architecture](#application-architecture)
- [State Management](#state-management)
- [Data Flow](#data-flow)
- [Component Structure](#component-structure)
- [Storage Strategy](#storage-strategy)
- [Design Patterns](#design-patterns)

## Overview

Learning English is a client-side web application built with Next.js 15, using the App Router architecture. The application follows modern React patterns with TypeScript for type safety.

## Technology Stack

### Core Framework
- **Next.js 15**: React framework with App Router
- **React 19**: UI library with latest features
- **TypeScript**: Type-safe JavaScript

### State Management
- **MobX**: Observable state management
- **React Hooks**: Local component state

### Styling
- **Tailwind CSS v4**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives

### Storage
- **LocalStorage**: Browser-based persistent storage

## Application Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Browser                           │
│  ┌───────────────────────────────────────────────┐  │
│  │           Next.js App Router                  │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │  Pages (Server Components)              │  │  │
│  │  │  - /home                                 │  │  │
│  │  │  - /add-word                             │  │  │
│  │  │  - /all-words                            │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │  Client Components                      │  │  │
│  │  │  - Interactive UI                       │  │  │
│  │  │  - Form handling                        │  │  │
│  │  │  - State management                     │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │        State Management (MobX)                │  │
│  │  - Words store                                │  │
│  │  - User inputs                                │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │           LocalStorage                        │  │
│  │  - Persistent word storage                    │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │     External APIs             │
         │  - Dictionary API             │
         │  - Translation API            │
         │  - Web Speech API             │
         └───────────────────────────────┘
```

## State Management

### MobX Store

The application uses MobX for observable state management with a centralized `Words` class:

```typescript
class Words {
  // Observable state
  wordTranslations: Map<string, string> = new Map();
  userInputs: Map<string, string> = new Map();

  constructor() {
    makeAutoObservable(this);
  }

  // Actions
  addWord(word: string, translation: string) { ... }
  deleteWord(word: string) { ... }
  setUserInput(word: string, value: string) { ... }

  // Computed values
  get correct() { ... }
  get allWords() { ... }
}
```

### React Hooks Integration

The `useWords` hook bridges MobX state with React components:

```typescript
export const useWords = () => {
  const [storedWords, setStoredWords] = useLocalStorage<[string, string][]>("words", []);

  useEffect(() => {
    if (storedWords && words.wordTranslations.size === 0) {
      words.setWords(storedWords);
    }
  }, [storedWords]);

  const addWord = (word: string, translation: string) => {
    words.addWord(word, translation);
    setStoredWords(Array.from(words.wordTranslations.entries()));
  };

  return { words, addWord, deleteWord, removeAllWords };
};
```

## Data Flow

### Adding a Word

```
User Input
    ↓
Validate Format (regex)
    ↓
Check Duplicate
    ↓
Validate with Dictionary API
    ↓
Fetch Translation (Google Translate)
    ↓
Fetch Definition (Dictionary API)
    ↓
Combine Translation + Definition
    ↓
Update MobX Store
    ↓
Sync to LocalStorage
    ↓
Update UI
```

### Practicing Words

```
Load from LocalStorage
    ↓
Initialize MobX Store
    ↓
Get Random Words (max 5)
    ↓
Display to User
    ↓
User Types Answer
    ↓
Update userInputs (MobX)
    ↓
Validate Answer (computed)
    ↓
Enable/Disable Submit Button
    ↓
On Submit: Refresh with New Words
```

## Component Structure

### Page Components

Each route has a dedicated page component:

```
src/app/
├── page.tsx              # Root redirect to /home
├── home/
│   └── page.tsx         # Practice interface
├── add-word/
│   └── page.tsx         # Add new words
└── all-words/
    └── page.tsx         # View all words
```

### UI Components

Reusable components in `src/components/ui/`:

```typescript
// Button component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

// Input component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

// Alert component
interface AlertProps {
  variant?: "default" | "destructive";
  children: React.ReactNode;
}
```

### Custom Hooks

Located in `src/hooks/`:

- `useWords`: Word management and persistence
- Built on `react-use` library hooks like `useLocalStorage`

## Storage Strategy

### LocalStorage Schema

```typescript
// Key: "words"
// Value: JSON array of [word, translation] tuples
[
  ["hello", "Used as a greeting or to begin a phone conversation\n你好"],
  ["world", "The earth, together with all of its countries and peoples\n世界"],
  // ...
]
```

### Storage Operations

**Save**:
```typescript
const saveWords = (words: Map<string, string>) => {
  const wordsArray = Array.from(words.entries());
  localStorage.setItem("words", JSON.stringify(wordsArray));
};
```

**Load**:
```typescript
const loadWords = (): Map<string, string> => {
  const stored = localStorage.getItem("words");
  if (!stored) return new Map();
  const parsed = JSON.parse(stored);
  return new Map(parsed);
};
```

## Design Patterns

### 1. Observer Pattern (MobX)

MobX implements the observer pattern, allowing components to reactively update when observable state changes:

```typescript
const Home = observer(() => {
  const { words } = useWords();
  
  // Component re-renders when words.wordTranslations changes
  return <div>{words.wordTranslations.size} words</div>;
});
```

### 2. Custom Hook Pattern

Encapsulates complex logic in reusable hooks:

```typescript
export const useWords = () => {
  // Logic for word management
  return { words, addWord, deleteWord };
};
```

### 3. Compound Component Pattern

UI components use composition:

```typescript
<form>
  <Input placeholder="Word" />
  <Button>Add</Button>
</form>
```

### 4. Repository Pattern

Centralized data access through the Words class:

```typescript
class Words {
  // Centralized storage operations
  get allWords() {
    return this.loadFromStorage();
  }
}
```

### 5. Fallback Pattern

Graceful degradation for API failures:

```typescript
try {
  return await fetchFromAPI();
} catch {
  return fallbackData[key] || null;
}
```

## File Organization

```
learning-english/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Root page (redirect)
│   │   ├── home/               # Practice page
│   │   ├── add-word/           # Add word page
│   │   └── all-words/          # View words page
│   ├── components/             # Reusable components
│   │   └── ui/                 # UI primitives
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       └── alert.tsx
│   ├── hooks/                  # Custom hooks
│   │   ├── index.ts            # Hook exports
│   │   └── useWords.ts         # Word management
│   └── lib/                    # Utilities
│       └── utils.ts            # Helper functions
├── docs/                       # Documentation
├── public/                     # Static assets
└── package.json               # Dependencies
```

## Performance Considerations

### Optimization Strategies

1. **Client-Side Rendering**: Pages use "use client" directive for interactivity
2. **Lazy Loading**: Components load on demand
3. **Memoization**: MobX computed values cache results
4. **Local Storage**: Reduces API calls by caching data

### Bundle Size

- Next.js automatic code splitting
- Tree shaking for unused code
- Dynamic imports for large components

## Security Considerations

1. **Input Validation**: All user input is validated
2. **XSS Prevention**: React automatically escapes content
3. **API Security**: No sensitive keys exposed
4. **HTTPS**: Always use secure connections for APIs

## Scalability

### Current Limitations

- LocalStorage limited to ~5-10MB
- Client-side only (no server-side persistence)
- Single language pair (English to Chinese)

### Future Enhancements

To scale the application:

1. **Database Backend**: Add PostgreSQL/MongoDB for storage
2. **User Authentication**: Implement user accounts
3. **API Rate Limiting**: Add request throttling
4. **Caching Layer**: Implement Redis for API responses
5. **Multi-language Support**: Extend translation capabilities

## Testing Strategy

### Recommended Approach

```typescript
// Unit tests for utilities
describe("validateWord", () => {
  it("should return true for valid words", async () => {
    expect(await validateWord("hello")).toBe(true);
  });
});

// Component tests
describe("AddWordPage", () => {
  it("should add word on submit", async () => {
    // Test implementation
  });
});

// Integration tests
describe("Word flow", () => {
  it("should complete add-practice-delete flow", async () => {
    // Test implementation
  });
});
```

## Deployment

The application can be deployed to:

- **Vercel**: Optimized for Next.js
- **Netlify**: Static site hosting
- **AWS Amplify**: Full-stack hosting
- **Docker**: Containerized deployment

### Build Process

```bash
npm run build    # Creates optimized production build
npm start        # Starts production server
```

## Monitoring and Debugging

### Development Tools

- React DevTools for component inspection
- MobX DevTools for state inspection
- Network tab for API monitoring
- Console for error logging

### Error Tracking

Consider integrating:
- Sentry for error tracking
- Google Analytics for usage metrics
- LogRocket for session replay

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [MobX Documentation](https://mobx.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
