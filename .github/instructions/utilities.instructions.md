---
applyTo: "src/lib/**"
---

# Utility Functions Instructions

## Scope
These instructions apply to utility functions and helper code in `src/lib/`.

## Purpose
The `lib` directory contains pure utility functions, helpers, and shared logic that can be used throughout the application.

## Current Utilities

### `cn()` Function (from utils.ts)
Combines Tailwind CSS classes intelligently using `clsx` and `tailwind-merge`.

**Purpose:**
- Merge multiple className strings
- Handle conditional classes
- Resolve Tailwind class conflicts

**Usage:**
```typescript
import { cn } from "@/lib/utils";

// Basic usage
<div className={cn("base-class", "another-class")} />

// Conditional classes
<div className={cn(
  "base-class",
  isActive && "active-class",
  isDisabled && "disabled-class"
)} />

// Merging with props
<div className={cn("base-class", className)} />

// Tailwind conflict resolution
cn("px-2", "px-4") // Results in "px-4" (later value wins)
```

**Implementation:**
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Creating New Utilities

### When to Add a Utility
Add to `lib` when:
- Logic is used in multiple places
- Function is pure (no side effects)
- Logic is complex and worth abstracting
- Helper improves code readability

Don't add if:
- Used in only one place
- Too simple (e.g., basic math)
- Component-specific logic
- Requires React hooks (use custom hooks instead)

### Utility Structure

**Basic Pattern:**
```typescript
/**
 * Brief description of what the function does
 * @param param1 - Description
 * @param param2 - Description
 * @returns Description of return value
 */
export function utilityName(param1: Type1, param2: Type2): ReturnType {
  // Implementation
  return result;
}
```

## Common Utility Categories

### String Utilities

**Example: Capitalize First Letter**
```typescript
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

**Example: Truncate String**
```typescript
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}
```

**Example: Slugify**
```typescript
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
```

### Array Utilities

**Example: Shuffle Array**
```typescript
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

**Example: Get Random Items**
```typescript
export function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = shuffle(array);
  return shuffled.slice(0, Math.min(count, array.length));
}
```

**Example: Unique Array**
```typescript
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}
```

### Object Utilities

**Example: Deep Clone**
```typescript
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  
  const clonedObj = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
}
```

**Example: Pick Properties**
```typescript
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}
```

### Number Utilities

**Example: Clamp**
```typescript
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
```

**Example: Random Range**
```typescript
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
```

**Example: Format Number**
```typescript
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}
```

### Date Utilities

**Example: Format Date**
```typescript
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(d);
}
```

**Example: Time Ago**
```typescript
export function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
    }
  }
  
  return "just now";
}
```

### Validation Utilities

**Example: Email Validation**
```typescript
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

**Example: URL Validation**
```typescript
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
```

**Example: Empty Check**
```typescript
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}
```

### Storage Utilities

**Example: Safe JSON Parse**
```typescript
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error("JSON parse error:", error);
    return defaultValue;
  }
}
```

**Example: Local Storage Wrapper**
```typescript
export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Storage error:", error);
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },

  clear(): void {
    localStorage.clear();
  }
};
```

## TypeScript Guidelines

### Generic Utilities
Use generics for type-safe utilities:

```typescript
export function identity<T>(value: T): T {
  return value;
}

export function first<T>(array: T[]): T | undefined {
  return array[0];
}

export function last<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}
```

### Type Guards
```typescript
export function isString(value: any): value is string {
  return typeof value === "string";
}

export function isNumber(value: any): value is number {
  return typeof value === "number" && !isNaN(value);
}

export function isArray<T>(value: any): value is T[] {
  return Array.isArray(value);
}
```

### Proper Type Annotations
```typescript
// ✅ Good: Explicit types
export function add(a: number, b: number): number {
  return a + b;
}

// ❌ Bad: No types
export function add(a, b) {
  return a + b;
}
```

## Pure Functions

### Characteristics
- No side effects
- Same input always produces same output
- Don't mutate arguments
- Don't depend on external state

**Example:**
```typescript
// ✅ Good: Pure function
export function double(n: number): number {
  return n * 2;
}

// ❌ Bad: Impure (side effect)
let total = 0;
export function add(n: number): number {
  total += n;
  return total;
}
```

### Immutability
Always return new values, never mutate:

```typescript
// ✅ Good: Returns new array
export function addItem<T>(array: T[], item: T): T[] {
  return [...array, item];
}

// ❌ Bad: Mutates original
export function addItem<T>(array: T[], item: T): T[] {
  array.push(item);
  return array;
}
```

## Error Handling

### Try-Catch Wrapper
```typescript
export function tryCatch<T>(
  fn: () => T,
  defaultValue: T,
  onError?: (error: Error) => void
): T {
  try {
    return fn();
  } catch (error) {
    if (onError) {
      onError(error as Error);
    }
    return defaultValue;
  }
}
```

### Safe Execution
```typescript
export function safeExecute<T>(
  fn: () => T,
  fallback: T
): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}
```

## Performance

### Memoization
Cache expensive calculations:

```typescript
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}
```

### Debounce
```typescript
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
```

### Throttle
```typescript
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
```

## Testing

### Testable Utilities
Pure functions are easy to test:

```typescript
// Easy to test
export function sum(a: number, b: number): number {
  return a + b;
}

// Test cases:
// sum(2, 3) === 5
// sum(0, 0) === 0
// sum(-1, 1) === 0
```

### Edge Cases
Always consider:
- Null/undefined inputs
- Empty arrays/strings/objects
- Boundary values (0, -1, MAX_INT)
- Invalid types
- Extreme values

## Documentation

### JSDoc Comments
Document complex utilities:

```typescript
/**
 * Formats a number as currency
 * @param amount - The numeric amount to format
 * @param currency - The currency code (default: 'USD')
 * @param locale - The locale for formatting (default: 'en-US')
 * @returns Formatted currency string
 * @example
 * formatCurrency(1234.56) // "$1,234.56"
 * formatCurrency(1234.56, 'EUR', 'de-DE') // "1.234,56 €"
 */
export function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency
  }).format(amount);
}
```

## File Organization

### Single File Pattern
Keep related utilities together:

```typescript
// utils.ts
export function cn(...inputs: ClassValue[]) { }
export function capitalize(str: string) { }
export function truncate(str: string, length: number) { }
```

### Multiple Files Pattern
Split into logical modules when file grows:

```
lib/
├── index.ts          # Re-exports
├── utils.ts          # General utilities (cn)
├── string-utils.ts   # String operations
├── array-utils.ts    # Array operations
└── date-utils.ts     # Date operations
```

**index.ts:**
```typescript
export * from "./utils";
export * from "./string-utils";
export * from "./array-utils";
export * from "./date-utils";
```

## Anti-patterns to Avoid

### Don't
- Create utilities with side effects
- Mutate function arguments
- Use global state
- Create overly complex utilities
- Add utilities used only once
- Forget error handling
- Skip TypeScript types

### Do
- Keep functions pure
- Return new values (immutability)
- Handle edge cases
- Add TypeScript types
- Write clear documentation
- Consider performance
- Test thoroughly
- Keep utilities focused and simple
