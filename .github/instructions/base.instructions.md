---
applyTo: "**"
---

# Learning English - Repository Instructions

## Project Overview

This is a modern language learning web application built with Next.js 15, React 19, and TypeScript. The app helps users learn English vocabulary through interactive practice, automatic translations, and audio pronunciation.

**Key Features:**
- Add English words with automatic definition and Chinese translation fetching
- Interactive quiz-style vocabulary practice
- Audio pronunciation using Web Speech API
- Cloud storage with Firebase Firestore (with offline sync queue)
- Word validation using Dictionary API
- Multi-language support (Chinese/English)
- User authentication via Google OAuth (NextAuth.js)
- Mastery tracking based on input speed and practice frequency

**Tech Stack:**
- Framework: Next.js 15 (App Router) with React 19
- Language: TypeScript (strict mode)
- State Management: MobX for reactive state
- Styling: Tailwind CSS v4
- UI Components: Radix UI primitives
- Database: Firebase Firestore
- Authentication: NextAuth.js with Google OAuth
- Package Manager: npm

## Development Environment Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   App runs on http://localhost:3000

3. **Linting:**
   ```bash
   npm run lint        # Check for issues
   npm run lint:fix    # Auto-fix issues
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Coding Standards

### General Principles
- Write clean, maintainable, and self-documenting code
- Keep changes minimal and focused
- Prioritize code quality and security
- Handle all errors gracefully with user-friendly messages
- Validate all user inputs

### TypeScript Guidelines
- Use TypeScript for all new files
- Enable strict mode checks
- Avoid `any` type - use proper typing
- Define clear interfaces and types
- Use meaningful variable and function names
- Prefer type inference where appropriate
- Use union types and type guards properly

### React Best Practices
- Use functional components with hooks
- Keep components small and focused (single responsibility)
- Use proper component naming (PascalCase)
- Implement proper error boundaries
- Use React 19 features appropriately
- Leverage Next.js App Router conventions
- Mark client components with "use client" directive when needed

### Next.js App Router Conventions
- Place page components in `src/app/[route]/page.tsx`
- Use layout.tsx for shared layouts
- Client components must have "use client" directive
- Server components by default (no directive needed)
- Use proper loading and error states

### State Management
- Use MobX for complex shared state
- Use `makeAutoObservable` for MobX stores
- Wrap components with `observer` from mobx-react-lite for reactivity
- **Important:** Don't use `useMemo` with MobX observables - let MobX track dependencies directly
- Use React hooks for local component state
- Keep state as local as possible
- Implement proper state initialization

### API Integration
- Always handle API failures gracefully
- Implement fallback mechanisms for critical APIs
- Use try-catch blocks for async operations
- Provide user feedback for loading states
- Never expose API keys in client-side code
- Validate API responses before using data

**External APIs Used:**
1. Dictionary API (https://api.dictionaryapi.dev) - word validation and definitions
2. Google Translate API - Chinese translations (with fallback dictionary)

### Styling Guidelines
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use the `cn()` utility from `@/lib/utils` for conditional classes
- Maintain consistent spacing and layout
- Use Radix UI components for complex UI patterns
- Keep styling inline with Tailwind classes (no separate CSS files unless necessary)

### Code Organization
```
src/
├── app/              # Next.js pages and routes
│   ├── home/         # Practice page
│   ├── add-word/     # Add word page
│   ├── profile/      # User profile & word statistics
│   ├── login/        # Authentication page
│   ├── api/          # API routes (NextAuth)
│   └── layout.tsx    # Root layout
├── components/       # Reusable React components
│   ├── ui/          # UI primitives (Button, Input, MasteryBar, Dialog, Toast)
│   └── auth/        # Authentication components (UserMenu)
├── hooks/           # Custom React hooks
│   ├── useFirestoreWords.ts  # Firestore word management with mastery tracking
│   ├── useLocale.ts  # i18n hook
│   └── useToast.ts   # Toast notifications
└── lib/             # Utility functions
    ├── utils.ts     # Helper utilities (cn)
    ├── firebase.ts  # Firebase configuration
    ├── i18n.ts      # Internationalization
    ├── masteryCalculator.ts  # Word mastery algorithm
    └── syncQueue.ts # Offline sync queue
```

### File and Folder Naming
- Use kebab-case for directories (e.g., `add-word/`)
- Use PascalCase for React components (e.g., `Button.tsx`)
- Use camelCase for utilities and hooks (e.g., `useWords.ts`)
- Use lowercase for config files (e.g., `tsconfig.json`)

### Code Style
- No unnecessary comments - code should be self-explanatory
- Add comments only for complex business logic or non-obvious solutions
- Use consistent indentation (2 spaces)
- Add trailing commas in multi-line structures
- Use semicolons consistently
- Keep lines under 100 characters when reasonable

### Git Conventions
- Write clear, concise commit messages (one line)
- Use present tense ("Add feature" not "Added feature")
- Keep commits focused and atomic
- Reference issue numbers when applicable

**Good commit examples:**
- "Add word pronunciation feature"
- "Fix translation API error handling"
- "Update README with API documentation"

## Testing Approach

Currently, no formal testing framework is configured. When adding tests:
- Focus on critical functionality
- Test API integrations with mocks
- Test error handling and edge cases
- Test component rendering and user interactions

## Browser Compatibility

- Target modern browsers with ES6+ support
- Requires localStorage API
- Web Speech API optional (for pronunciation)
- Test in Chrome, Firefox, Safari, and Edge

## Common Patterns

### Adding New Features
1. Identify the appropriate location (page, component, hook, utility)
2. Follow existing code patterns
3. Add proper TypeScript types
4. Handle errors gracefully
5. Test manually in the browser
6. Run linting before committing

### Working with Firestore
- Use `useFirestoreWords` hook for word management (cloud storage)
- Real-time sync with Firestore using onSnapshot
- Offline-first: changes queue locally and sync when online
- Use `useLocale` hook for internationalization
- Legacy `useWords` hook still available for localStorage (deprecated)

### Word Mastery Algorithm
The mastery system tracks user familiarity with words using a 0-100 score. See `docs/WORD_FAMILIARITY_ALGORITHM.md` for full details.

**Key Files:**
- `src/lib/masteryCalculator.ts` - Core algorithm implementation
- `src/components/ui/frequency-bar.tsx` - MasteryBar UI component

**Data Structure (per word):**
```typescript
interface WordData {
  word: string;
  translation: string;
  correctCount: number;      // Correct attempts
  totalAttempts: number;     // Total attempts (correct + incorrect)
  inputTimes: number[];      // Last 20 input times in seconds
  lastPracticedAt: Date | null;
  createdAt: Date;
}
```

**Mastery Score Calculation (0-100):**
- If `totalAttempts === 0`, score is 0 (never practiced)
- Otherwise: `accuracy * 0.4 + speed * 0.3 + consistency * 0.3`
  - Accuracy: `(correctCount / totalAttempts) * 100`
  - Speed: Based on input time vs expected time (`wordLength * 0.3 + 1.0` seconds)
  - Consistency: Based on variance of last 10 input times

**Mastery Levels:**
| Score | Level | Color |
|-------|-------|-------|
| 0-19 | New | Red |
| 20-39 | Learning | Orange |
| 40-59 | Familiar | Yellow |
| 60-79 | Proficient | Lime |
| 80-100 | Mastered | Green |

**Practice Priority (word selection):**
```
priority = (100 - masteryScore) * recencyMultiplier * practiceCountMultiplier
```
- Lower mastery = higher priority
- Not practiced recently = higher priority
- New words (never practiced) = highest priority

### API Error Handling Pattern
```typescript
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Request failed");
  }
  const data = await response.json();
  // Use data
} catch (error) {
  console.error("API error:", error);
  // Provide fallback or user feedback
}
```

## Performance Considerations
- Minimize bundle size
- Lazy load components when appropriate
- Optimize images and assets
- Use proper caching strategies
- Avoid unnecessary re-renders

## Security Best Practices
- Never store sensitive data in localStorage
- Validate and sanitize all user inputs
- Use HTTPS for all API calls
- Implement proper CORS handling
- Don't expose internal implementation details

## Accessibility
- Use semantic HTML elements
- Add proper ARIA labels where needed
- Ensure keyboard navigation works
- Maintain proper heading hierarchy
- Test with screen readers when possible

## Questions or Issues?
- Check README.md for setup and usage instructions
- Review CONTRIBUTING.md for contribution guidelines
- Check existing code for patterns and examples
- Open an issue for bugs or feature requests
