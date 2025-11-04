# Quick Start Guide

Get up and running with Learning English in 5 minutes!

## Prerequisites

Make sure you have these installed:
- Node.js 18.17 or higher
- npm (comes with Node.js)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/lnwu/learning-english.git
cd learning-english
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, React, MobX, and Tailwind CSS.

### Step 3: Start Development Server

```bash
npm run dev
```

You should see:
```
  ▲ Next.js 15
  - Local:        http://localhost:3000
  - Experiments:  Turbopack
```

### Step 4: Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

You're done! 🎉

## First Steps

### 1. Add Your First Word

1. Click "Add New Word" button
2. Type a word, for example: `hello`
3. Click "Add" button
4. The app will automatically:
   - Validate the word
   - Fetch the definition
   - Translate to Chinese
   - Save it locally

### 2. Practice Your Words

1. Go back to the home page
2. You'll see words with their translations
3. Type the English word for each translation
4. Click "Refresh" when all answers are correct

### 3. View All Words

1. Click "View All Words"
2. See your complete vocabulary list
3. Delete words by clicking the 🗑️ icon

## Project Structure

```
learning-english/
├── src/
│   ├── app/              # Pages
│   │   ├── home/         # Practice page
│   │   ├── add-word/     # Add word page
│   │   └── all-words/    # View all words page
│   ├── components/ui/    # UI components
│   ├── hooks/           # Custom hooks
│   └── lib/             # Utilities
├── docs/                # Documentation
└── package.json         # Dependencies
```

## Making Your First Change

### Example: Change the Maximum Words

Edit `src/hooks/useWords.ts`:

```typescript
class Words {
  static MAX_RANDOM_WORDS = 10; // Change from 5 to 10
  // ...
}
```

Save the file and the page will automatically reload!

## Common Commands

```bash
# Development
npm run dev          # Start dev server with hot-reload

# Production
npm run build        # Create optimized build
npm start           # Start production server

# Code Quality
npm run lint        # Check for linting errors
npm run lint:fix    # Fix linting errors automatically
```

## Troubleshooting

### Port 3000 Already in Use?

```bash
# Use a different port
npm run dev -- -p 3001
```

### Dependencies Won't Install?

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors?

```bash
# Check Node.js version
node --version  # Should be 18.17 or higher

# Update dependencies
npm update
```

## Next Steps

- Read the [Architecture Guide](./ARCHITECTURE.md) to understand the codebase
- Check out [API Documentation](./API.md) for API details
- See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines
- Explore the code in `src/` directory

## Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## Getting Help

- Check existing issues on GitHub
- Open a new issue for bugs or questions
- Read the documentation in the `docs/` folder

## Development Tips

### Hot Reload

The development server automatically reloads when you save files. No need to refresh the browser!

### Browser DevTools

Open DevTools (F12) to:
- Inspect React components
- View console logs
- Monitor network requests
- Debug JavaScript

### VS Code Extensions

Recommended extensions:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

### Environment Variables

Create `.env.local` for local environment variables:

```bash
# .env.local
NEXT_PUBLIC_API_URL=your-api-url
```

Access in code:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

## Example Workflow

Here's a typical development workflow:

```bash
# 1. Create a new branch
git checkout -b feature/my-new-feature

# 2. Make changes to the code
# Edit files in src/

# 3. Test your changes
npm run dev
# Test in browser

# 4. Check code quality
npm run lint

# 5. Commit your changes
git add .
git commit -m "Add my new feature"

# 6. Push to GitHub
git push origin feature/my-new-feature

# 7. Open a pull request on GitHub
```

## Resources

- **README.md**: Project overview and setup
- **CONTRIBUTING.md**: How to contribute
- **docs/ARCHITECTURE.md**: System architecture
- **docs/API.md**: API integration details

Happy coding! 🚀
