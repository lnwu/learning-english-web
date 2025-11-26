---
applyTo: "src/app/**"
---

# Frontend Application Instructions

## Scope
These instructions apply to all Next.js App Router pages and layouts in `src/app/`.

## Page Structure Guidelines

### File Organization
- Each route has its own directory under `src/app/`
- Main page component: `page.tsx`
- Shared layout: `layout.tsx`
- Loading states: `loading.tsx`
- Error boundaries: `error.tsx`

### Client vs Server Components
- **Use "use client" directive when:**
  - Component uses React hooks (useState, useEffect, etc.)
  - Component handles browser events (onClick, onChange, etc.)
  - Component uses browser APIs (localStorage, Web Speech API)
  - Component uses MobX observables

- **Keep as Server Component (no directive) when:**
  - Component only renders static content
  - Component fetches data server-side
  - Component doesn't need interactivity

### Page Component Pattern
```typescript
"use client"; // Only if needed

import { useState } from "react";
import { useWords } from "@/hooks";
import { Button, Input } from "@/components/ui";

const PageName = () => {
  // State and hooks
  const [state, setState] = useState("");
  const { words, addWord } = useWords();

  // Event handlers
  const handleSubmit = () => {
    // Handle logic
  };

  // Render
  return (
    <div className="container mx-auto p-4">
      {/* Content */}
    </div>
  );
};

export default PageName;
```

## Form Handling

### Input Management
- Use controlled components with useState
- Use refs for programmatic focus management
- Clear inputs after successful submission
- Provide immediate validation feedback

### Validation
- Validate before API calls
- Show clear error messages
- Disable submit button during loading
- Handle both client and server-side validation

### Loading States
- Show loading indicator during async operations
- Disable form inputs while loading
- Prevent double submissions

**Example:**
```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  if (loading) return; // Prevent double submission
  
  setLoading(true);
  try {
    await apiCall();
    // Success handling
  } catch (error) {
    // Error handling
  } finally {
    setLoading(false);
  }
};
```

## API Integration in Pages

### Fetching Data
- Use try-catch for all API calls
- Implement fallback mechanisms
- Show loading states
- Display user-friendly error messages

### Error Handling
```typescript
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Descriptive error message");
  }
  const data = await response.json();
  // Process data
} catch (error) {
  console.error("Operation failed:", error);
  // Show user feedback (toast, alert, etc.)
}
```

## Navigation

### Links
- Use Next.js `Link` component for internal navigation
- Use descriptive link text for accessibility
- Maintain navigation state when appropriate

**Example:**
```typescript
import Link from "next/link";

<Link href="/add-word" className="text-blue-500 hover:underline">
  Add New Word
</Link>
```

### Programmatic Navigation
- Use `useRouter` hook when needed
- Handle navigation errors
- Maintain user context

## Styling in Pages

### Layout Guidelines
- Use consistent container classes
- Maintain responsive design (mobile-first)
- Use flexbox/grid for layouts
- Keep consistent spacing (p-4, gap-4, etc.)

### Common Layout Pattern
```typescript
<div className="container mx-auto p-4 max-w-2xl">
  <header className="mb-6">
    <h1 className="text-2xl font-bold">Page Title</h1>
  </header>
  
  <main className="space-y-4">
    {/* Content */}
  </main>
  
  <footer className="mt-8">
    {/* Navigation or actions */}
  </footer>
</div>
```

## State Management in Pages

### Local State
- Use useState for component-specific state
- Use useRef for DOM references
- Keep state as local as possible
- Lift state only when necessary

### Shared State (MobX)
- Use the `useFirestoreWords` hook for word-related state
- Wrap components with `observer` from mobx-react-lite
- Access reactive state directly - MobX tracks dependencies automatically
- **Don't use useMemo/useCallback with MobX observables** - it breaks reactivity
- Ensure all hooks are called before any conditional returns (Rules of Hooks)

**Example:**
```typescript
import { observer } from "mobx-react-lite";

const Component = observer(() => {
  const { words, addWord, deleteWord, loading } = useFirestoreWords();
  const { t } = useLocale();

  // ✅ Good: Direct access (MobX tracks)
  const allWords = words.allWords;
  const avgTime = words.getAverageInputTime(word);

  // ❌ Bad: useMemo with MobX observable
  const allWords = useMemo(() => words.allWords, [words]);

  if (loading) return <div>{t('common.loading')}</div>;

  // ... rest of component
});
```

## Audio Features

### Text-to-Speech
- Check browser support before using
- Handle speech synthesis errors
- Provide fallback when unsupported

**Pattern:**
```typescript
const speak = (text: string) => {
  if (!window.speechSynthesis) {
    console.warn("Speech synthesis not supported");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
};
```

## User Feedback

### Success Messages
- Show clear confirmation after actions
- Auto-dismiss or require user acknowledgment
- Use appropriate styling (green for success)

### Error Messages
- Be specific about what went wrong
- Suggest corrective actions when possible
- Use appropriate styling (red for errors)

### Loading Indicators
- Show for operations > 300ms
- Position appropriately in context
- Use clear visual indicators

## Accessibility

### Semantic HTML
- Use proper heading hierarchy (h1, h2, h3)
- Use buttons for actions, links for navigation
- Use form labels properly
- Add alt text for images

### Keyboard Navigation
- Ensure all interactive elements are keyboard accessible
- Maintain logical tab order
- Handle Enter key for form submission
- Focus management for dynamic content

### ARIA Labels
- Add labels for icon-only buttons
- Use aria-live for dynamic content updates
- Provide context for screen readers

## Performance

### Optimization Tips
- Minimize component re-renders
- Use proper key props in lists
- Lazy load heavy components
- Optimize images with Next.js Image component

### Avoid Anti-patterns
- Don't create components inside render
- Don't use array index as key in dynamic lists
- Don't mutate state directly
- Don't forget cleanup in useEffect

## Common Page Types

### Home/Practice Page
- Display random words for practice (weighted by mastery)
- Handle user input validation
- Provide audio pronunciation (Web Speech API)
- Show feedback (correct/incorrect with hint on focus)
- Track input speed and update word frequency
- Real-time sync to Firestore

### Add Word Page
- Input validation (English letters only)
- API integration (dictionary + translation)
- Loading states with i18n support
- Success/error feedback in user's language

### Profile Page
- User account information
- Language settings (Chinese/English)
- Learning statistics (total words, average time, words practiced)
- Word performance grouped by length category
- Search/filter words functionality
- Reset practice records option

## Testing Considerations

When testing pages:
- Test happy path (normal user flow)
- Test error scenarios (API failures)
- Test edge cases (empty inputs, special characters)
- Test loading states
- Test keyboard navigation
- Test on different screen sizes
