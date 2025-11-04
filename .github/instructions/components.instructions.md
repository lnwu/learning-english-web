---
paths:
  - "src/components/**"
---

# Component Development Instructions

## Scope
These instructions apply to all React components in `src/components/`.

## Component Architecture

### UI Components (`src/components/ui/`)
These are reusable, primitive UI components built on Radix UI or custom implementations.

**Characteristics:**
- Generic and reusable across the app
- Accept props for customization
- Use forwardRef for ref forwarding
- Implement proper TypeScript types
- Style with Tailwind CSS
- Support common variants

### Custom Components
Application-specific components that compose UI primitives.

**Characteristics:**
- Focused on specific features
- May include business logic
- Use UI components internally
- Handle local state when needed

## Component Structure

### Basic Pattern
```typescript
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ComponentProps {
  className?: string;
  // Other props
}

const Component = forwardRef<HTMLElement, ComponentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("base-classes", className)} {...props}>
        {/* Content */}
      </div>
    );
  }
);

Component.displayName = "Component";

export { Component };
```

### Props Interface Guidelines
- Define clear interface for component props
- Use optional props with `?` when appropriate
- Extend HTML element props when wrapping native elements
- Document complex props with JSDoc comments (when necessary)

**Example:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}
```

## Styling Components

### Using the `cn` Utility
- Import from `@/lib/utils`
- Merge base classes with custom classes
- Handle conditional classes elegantly

**Pattern:**
```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "base-class-1 base-class-2",
  variant === "primary" && "primary-classes",
  disabled && "disabled-classes",
  className // User-provided classes
)} />
```

### Variant Patterns
Use object-based variants for maintainability:

```typescript
const variants = {
  default: "bg-blue-500 text-white",
  outline: "border border-blue-500 text-blue-500",
  ghost: "text-blue-500 hover:bg-blue-50"
};

<button className={cn(variants[variant], className)} />
```

### Size Variants
```typescript
const sizes = {
  sm: "px-2 py-1 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg"
};
```

## UI Component Guidelines

### Button Component
- Support variants (default, outline, ghost, destructive)
- Support sizes (sm, md, lg)
- Handle disabled state
- Support loading state
- Forward refs properly
- Merge custom className

### Input Component
- Support different types (text, email, password, etc.)
- Handle disabled state
- Support error state styling
- Forward refs for form libraries
- Merge custom className
- Include proper focus styles

### Alert Component
- Support variants (info, success, warning, error)
- Allow custom icons
- Support dismissible alerts
- Proper accessibility attributes

## Ref Forwarding

### When to Use
- Form inputs (for focus management)
- Scrollable containers
- Elements needing direct DOM access
- Custom hook integration

### Pattern
```typescript
import { forwardRef } from "react";

const Input = forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    return <input ref={ref} {...props} />;
  }
);

Input.displayName = "Input";
```

## Composition

### Composing UI Components
Build complex components from simple ones:

```typescript
const SearchInput = () => {
  return (
    <div className="relative">
      <Input 
        type="search" 
        placeholder="Search..." 
        className="pl-10"
      />
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2" />
    </div>
  );
};
```

### Children Prop
Use `children` for flexible composition:

```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className }: CardProps) => {
  return (
    <div className={cn("rounded-lg border p-4", className)}>
      {children}
    </div>
  );
};
```

## State Management in Components

### Local State
- Use useState for component-specific state
- Keep state close to where it's used
- Lift state when multiple components need it

### Props vs State
- **Props:** Data from parent component
- **State:** Data that changes over time within component

### Controlled Components
For form inputs, use controlled pattern:

```typescript
const [value, setValue] = useState("");

<Input 
  value={value} 
  onChange={(e) => setValue(e.target.value)} 
/>
```

## Event Handling

### Naming Convention
- Use `handle` prefix: `handleClick`, `handleChange`
- Be specific: `handleSubmit`, `handleDelete`

### Event Handler Pattern
```typescript
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  // Handle click
};

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setValue(event.target.value);
};
```

## Accessibility

### Semantic HTML
- Use appropriate HTML elements
- Add proper ARIA attributes
- Maintain focus management

### Keyboard Support
- Buttons trigger on Enter/Space
- Inputs support standard keyboard navigation
- Custom components support keyboard interactions

### ARIA Attributes
```typescript
<button
  aria-label="Close dialog"
  aria-pressed={isPressed}
  aria-disabled={isDisabled}
>
  Close
</button>
```

## Component Exports

### Named Exports (Preferred)
```typescript
// Component file
export { Button } from "./button";

// Usage
import { Button } from "@/components/ui";
```

### Index File Pattern
Create `index.ts` to group exports:

```typescript
// src/components/ui/index.ts
export { Button } from "./button";
export { Input } from "./input";
export { Alert } from "./alert";
```

## TypeScript Types

### Component Props
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
  loading?: boolean;
}
```

### Children Types
```typescript
children?: React.ReactNode;  // For any React content
children: string;            // For text only
children: React.ReactElement; // For single element
```

### Event Handler Types
```typescript
onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
```

## Performance

### Optimization Tips
- Use React.memo for expensive components
- Avoid inline function definitions in render
- Use useCallback for event handlers passed to children
- Use useMemo for expensive calculations

### Avoid Re-renders
```typescript
// ❌ Bad: Creates new function every render
<Button onClick={() => handleClick(id)} />

// ✅ Good: Stable function reference
const handleClickWithId = useCallback(() => {
  handleClick(id);
}, [id]);

<Button onClick={handleClickWithId} />
```

## Testing Components

### What to Test
- Component renders without errors
- Props are applied correctly
- User interactions work as expected
- Accessibility features function properly
- Edge cases (empty states, errors, etc.)

### Testable Components
Write components that are easy to test:
- Accept data through props
- Keep logic simple and focused
- Separate business logic from presentation
- Use proper semantic HTML

## Common Patterns

### Loading State
```typescript
interface ButtonProps {
  loading?: boolean;
}

const Button = ({ loading, children, disabled, ...props }: ButtonProps) => {
  return (
    <button disabled={disabled || loading} {...props}>
      {loading ? "Loading..." : children}
    </button>
  );
};
```

### Error State
```typescript
interface InputProps {
  error?: string;
}

const Input = ({ error, className, ...props }: InputProps) => {
  return (
    <div>
      <input 
        className={cn(
          "border rounded",
          error && "border-red-500",
          className
        )}
        {...props}
      />
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
};
```

### Conditional Rendering
```typescript
{isLoading && <Spinner />}
{error && <Alert variant="error">{error}</Alert>}
{data && <DataDisplay data={data} />}
{!data && !isLoading && <EmptyState />}
```

## Documentation

### When to Add Comments
- Complex styling decisions
- Accessibility considerations
- Workarounds for browser quirks
- Non-obvious props behavior

### JSDoc for Complex Props
```typescript
interface Props {
  /**
   * Callback fired when the component is dismissed.
   * Only available when `dismissible` is true.
   */
  onDismiss?: () => void;
}
```

## Anti-patterns to Avoid

### Don't
- Create components inside render functions
- Mutate props
- Use array index as key in dynamic lists
- Forget to forward refs when needed
- Over-engineer simple components
- Create overly generic components
- Skip TypeScript types

### Do
- Keep components focused and simple
- Use proper TypeScript types
- Forward refs when appropriate
- Use semantic HTML
- Implement accessibility features
- Style with Tailwind utilities
- Export named components
- Test edge cases
