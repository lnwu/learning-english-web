---
applyTo: "src/hooks/**"
---

# Custom Hooks Instructions

## Scope
These instructions apply to all custom React hooks in `src/hooks/`.

## Hook Basics

### Naming Convention
- Always start with `use` prefix
- Use camelCase: `useWords`, `useLocalStorage`, `useFetch`
- Name describes what the hook does or provides

### File Organization
- One hook per file (unless closely related)
- File name matches hook name: `useWords.ts`
- Export from `index.ts` for clean imports

**Example structure:**
```
hooks/
├── index.ts              # Re-exports all hooks
├── useFirestoreWords.ts  # Firestore word management (primary)
├── useWords.ts           # LocalStorage word management (legacy)
├── useLocale.ts          # Internationalization hook
└── useToast.ts           # Toast notification hook
```

### Import/Export Pattern
```typescript
// hooks/index.ts
export { useWords } from "./useWords";
export { useLocalStorage } from "./useLocalStorage";

// Usage in components
import { useWords } from "@/hooks";
```

## Hook Structure

### Basic Pattern
```typescript
import { useState, useEffect } from "react";

export const useCustomHook = (initialValue: string) => {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // Effect logic
  }, []);

  const handler = () => {
    // Handler logic
  };

  return { state, handler };
};
```

### Return Values
Choose return type based on use case:

**Object (Multiple Values):**
```typescript
return { value, setValue, reset };
```

**Array (Order Matters):**
```typescript
return [value, setValue] as const;
```

**Single Value:**
```typescript
return value;
```

## The `useFirestoreWords` Hook

### Purpose
Manages word vocabulary state with Firebase Firestore cloud storage and MobX reactivity.

### Architecture
- Uses MobX `Words` class for reactive state
- Integrates with Firebase Firestore for cloud persistence
- Real-time sync using Firestore onSnapshot
- Offline-first with sync queue for pending changes
- Provides methods for word CRUD operations
- Tracks input times and mastery frequency

### Key Components

#### 1. MobX Store Class
```typescript
class Words {
  wordTranslations: Map<string, string> = new Map();
  wordFrequencies: Map<string, number> = new Map();
  wordInputTimes: Map<string, number[]> = new Map();
  userInputs: Map<string, string> = new Map();

  constructor() {
    makeAutoObservable(this);
  }

  // Methods for state manipulation
  addWord(word: string, translation: string, id: string) { }
  deleteWord(word: string) { }
  updateFrequency(word: string, delta: number) { }
  addInputTime(word: string, timeInSeconds: number) { }
  
  // Computed properties
  get allWords(): Map<string, string> { }
  getAverageInputTime(word: string): number | null { }
  getFrequency(word: string): number { }
}
```

#### 2. Hook Integration
```typescript
export const useFirestoreWords = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Setup Firestore real-time listener
    const unsubscribe = onSnapshot(wordsCollection, (snapshot) => {
      words.setWords(snapshot.docs.map(doc => doc.data()));
    });
    return unsubscribe;
  }, [session]);

  return { 
    words, 
    addWord, 
    deleteWord, 
    updateWordFrequency, 
    saveInputTime,
    syncToFirestore,
    loading, 
    syncing,
    pendingCount 
  };
};
```

### Usage Guidelines

**In Components (with observer):**
```typescript
import { observer } from "mobx-react-lite";

const Component = observer(() => {
  const { words, addWord, deleteWord, loading, syncing, pendingCount } = useFirestoreWords();

  if (loading) return <div>Loading...</div>;

  // Access reactive properties directly (MobX tracks dependencies)
  const allWords = words.allWords;
  const avgTime = words.getAverageInputTime("hello");
  const frequency = words.getFrequency("hello");

  // Call methods
  await addWord("hello", "definition\ntranslation");
  await deleteWord("hello");
});
```

**Important MobX + React Pattern:**
```typescript
// ✅ Good: Direct access in observer component (MobX tracks)
const totalWords = words.allWords.size;

// ❌ Bad: useMemo with MobX observable (breaks reactivity)
const totalWords = useMemo(() => words.allWords.size, [words]);
```

## The `useLocale` Hook

### Purpose
Provides internationalization (i18n) support with Chinese and English translations.

### Usage
```typescript
const { locale, setLocale, t } = useLocale();

// Get translated text
<h1>{t('profile.title')}</h1>

// Change language
<button onClick={() => setLocale('en')}>English</button>
<button onClick={() => setLocale('zh')}>中文</button>
```

## MobX Integration

### Making Stores Observable
```typescript
import { makeAutoObservable } from "mobx";

class Store {
  data = [];

  constructor() {
    makeAutoObservable(this);
  }
}
```

### Computed Properties
Use getters for derived state:
```typescript
get filteredData() {
  return this.data.filter(item => item.active);
}
```

### Actions
Methods that modify state are automatically actions:
```typescript
addItem(item) {
  this.data.push(item);
}
```

### Component Integration
No special wrappers needed - components re-render on observable changes:
```typescript
const { words } = useWords();
const count = words.allWords.size; // Reactive
```

## LocalStorage Integration

### Using react-use
```typescript
import { useLocalStorage } from "react-use";

const [value, setValue] = useLocalStorage<Type>("key", defaultValue);
```

### Syncing with MobX
```typescript
useEffect(() => {
  if (storedWords) {
    words.setWords(storedWords);
  }
}, [storedWords, words]);
```

### Persisting Changes
```typescript
const addWord = (word: string, translation: string) => {
  words.addWord(word, translation);
  setStoredWords(Array.from(words.wordTranslations));
};
```

### Error Handling
```typescript
try {
  const stored = localStorage.getItem("key");
  if (stored) {
    return JSON.parse(stored);
  }
} catch (error) {
  console.error("Failed to parse localStorage:", error);
  return defaultValue;
}
```

## Creating New Hooks

### State Management Hook
```typescript
export const useCounter = (initialValue = 0) => {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount(prev => prev - 1);
  }, []);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  return { count, increment, decrement, reset };
};
```

### Data Fetching Hook
```typescript
export const useFetch = <T>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Fetch failed");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};
```

### Form Hook
```typescript
export const useForm = <T extends Record<string, any>>(initialValues: T) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return { values, errors, handleChange, reset };
};
```

## Hook Dependencies

### Rules of Hooks
1. Only call hooks at the top level
2. Only call hooks from React functions
3. Don't call hooks conditionally

### Dependency Arrays
Be explicit about dependencies:

```typescript
// ❌ Bad: Missing dependency
useEffect(() => {
  doSomething(value);
}, []);

// ✅ Good: Includes all dependencies
useEffect(() => {
  doSomething(value);
}, [value]);
```

### Stable References
Use useCallback and useMemo to prevent unnecessary re-renders:

```typescript
const handler = useCallback(() => {
  doSomething(value);
}, [value]);

const computed = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
```

## TypeScript in Hooks

### Generic Hooks
```typescript
export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(defaultValue);
  // Implementation
  return [value, setValue] as const;
};
```

### Return Type Inference
Let TypeScript infer when possible:
```typescript
// TypeScript infers return type
export const useCounter = () => {
  const [count, setCount] = useState(0);
  return { count, setCount };
};
```

### Explicit Return Types
Use explicit types for complex returns:
```typescript
interface UseWordsReturn {
  words: Words;
  addWord: (word: string, translation: string) => void;
  deleteWord: (word: string) => void;
}

export const useWords = (): UseWordsReturn => {
  // Implementation
};
```

## Performance Optimization

### Avoid Unnecessary Re-renders
```typescript
// Create instance once
const [store] = useState(() => new Store());

// Stable callback reference
const handler = useCallback(() => {
  store.doSomething();
}, [store]);
```

### Lazy Initialization
```typescript
// ❌ Bad: Creates object every render
const [state] = useState(new ExpensiveObject());

// ✅ Good: Creates object once
const [state] = useState(() => new ExpensiveObject());
```

### Memoization
```typescript
const processedData = useMemo(() => {
  return data.map(item => processItem(item));
}, [data]);
```

## Error Handling

### Try-Catch in Hooks
```typescript
export const useFetch = (url: string) => {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
        }
        // Process data
      } catch (err) {
        setError(err as Error);
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, [url]);

  return { error };
};
```

### Graceful Degradation
```typescript
export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error("LocalStorage error:", error);
      return defaultValue;
    }
  });

  return [value, setValue];
};
```

## Testing Hooks

### Testable Design
- Keep hooks pure when possible
- Separate business logic from side effects
- Use dependency injection for testing

### Testing Pattern
```typescript
// Hook
export const useCounter = (initialValue = 0) => {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount(c => c + 1);
  return { count, increment };
};

// Test (if testing framework exists)
// Test initial value
// Test increment functionality
// Test with different initial values
```

## Common Patterns

### Cleanup Pattern
```typescript
useEffect(() => {
  const subscription = api.subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### Debouncing
```typescript
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};
```

### Previous Value
```typescript
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};
```

## Anti-patterns to Avoid

### Don't
- Call hooks conditionally or in loops
- Forget cleanup in useEffect
- Ignore dependency warnings
- Create hooks that are too complex
- Put business logic directly in hooks (use stores/services)

### Do
- Keep hooks focused on one concern
- Return stable references when possible
- Handle errors gracefully
- Document complex hooks
- Test hooks thoroughly
- Use TypeScript generics appropriately
