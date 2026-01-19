# Learning English

A modern web application designed to help users learn English vocabulary through interactive word practice and automatic translations.

## Features

- **Google OAuth Authentication**: Secure sign-in with your Google account
- **Add New Words**: Automatically fetch English definitions and Chinese translations
- **Word Validation**: Validates words using dictionary API to ensure they're real English words
- **Interactive Practice**: Quiz-style interface to practice your vocabulary
- **Audio Pronunciation**: Listen to word pronunciations with text-to-speech
- **Cloud Storage**: Firebase Firestore with offline sync queue
- **Word Management**: View, add, and delete words from your collection
- **Smart Translations**: Combines English definitions with Chinese translations

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with React 19
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Authentication**: [NextAuth.js v5 (Auth.js)](https://authjs.dev/)
- **State Management**: [MobX](https://mobx.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Package Manager**: npm
- **Runtime**: Node.js

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18.17 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/lnwu/learning-english.git
cd learning-english
```

2. Install dependencies:
```bash
npm install
```

3. Set up Google OAuth authentication:
   - Follow the detailed guide in [docs/GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md)
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Fill in your Google OAuth credentials in `.env.local`

## Usage

### Development Mode

Start the development server with hot-reloading:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

### Linting

Check code quality:

```bash
npm run lint
```

Fix linting issues automatically:

```bash
npm run lint:fix
```

## Application Structure

```
learning-english/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── home/         # Main practice page
│   │   ├── add-word/     # Add new words page
│   │   ├── profile/      # User profile & stats
│   │   ├── login/        # Authentication page
│   │   └── layout.tsx    # Root layout
│   ├── components/       # React components
│   │   ├── auth/         # Auth UI (UserMenu)
│   │   └── ui/           # UI components (Button, Input, Alert)
│   ├── hooks/           # Custom React hooks
│   │   ├── useFirestoreWords.ts  # Word management (primary)
│   │   └── useWords.ts           # LocalStorage (legacy)
│   └── lib/             # Utility functions
├── public/              # Static assets
└── package.json         # Project dependencies
```

## How It Works

### Authentication

1. When you first visit the app, you'll be redirected to the login page
2. Click **"Sign in with Google"** to authenticate
3. Grant the requested permissions (email and profile)
4. You'll be redirected back to the app and can start using it

### Adding Words

1. Navigate to the "Add New Word" page
2. Enter an English word
3. The app automatically:
   - Validates the word is a real English word
   - Fetches the English definition from [Dictionary API](https://dictionaryapi.dev/)
   - Translates the word to Chinese using Google Translate API
   - Saves both definition and translation

**Example:**
```
Input: "hello"
Result: 
  Definition: "Used as a greeting or to begin a phone conversation"
  Translation: "你好"
```

### Practicing Words

1. The home page displays random words from your collection
2. See the translation/definition and type the English word
3. Get instant feedback (✅ or ❌)
4. Click the 🔊 icon to hear pronunciation
5. Submit when all answers are correct to get new words

### Managing Words

- **View All Words**: See your complete vocabulary list
- **Delete Words**: Remove words you no longer want to practice
- **Cloud Storage**: Words are stored in Firebase Firestore with offline sync queue
- **LocalStorage (Legacy)**: `useWords` remains for local-only usage
- **Migration Tool**: Migrate localStorage data to Firestore (see [Migration Guide](docs/MIGRATION_GUIDE.md))

## Cloud Storage

Want to sync your words across devices? Use Firebase Firestore:

- **[Firebase Firestore Guide](docs/FIREBASE_IMPLEMENTATION_GUIDE.md)** - Step-by-step setup (Recommended, ~45 min)
- **[Migration Guide](docs/MIGRATION_GUIDE.md)** - Move your existing words to the cloud (5 min) ⭐ NEW

## API Integration

The application uses two external APIs:

1. **Dictionary API** (`https://api.dictionaryapi.dev/api/v2/entries/en/{word}`)
   - Purpose: Validate words and fetch English definitions
   - Free tier: No API key required

2. **Google Translate API** (`https://translate.googleapis.com/translate_a/single`)
   - Purpose: Translate English words to Chinese
   - Fallback: Built-in dictionary for common words

## Code Examples

### Using the useFirestoreWords Hook

```typescript
import { useFirestoreWords } from "@/hooks";

function MyComponent() {
  const { words, addWord, deleteWord } = useFirestoreWords();
  
  // Add a new word
  addWord("example", "an example definition\n例子");
  
  // Delete a word
  deleteWord("example");
  
  // Access all words
  const allWords = words.allWords;
  
  return <div>Total words: {allWords.size}</div>;
}
```

### Word Validation Example

```typescript
const validateWord = async (word: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    if (!response.ok) {
      throw new Error("Word not found");
    }
    const data = await response.json();
    return data.length > 0;
  } catch {
    return false;
  }
};
```

## Configuration

### Authentication

The app uses NextAuth.js v5 (Auth.js) for Google OAuth authentication.

**Required environment variables:**
- `AUTH_SECRET`: Random secret for session encryption (generate with `openssl rand -base64 32`)
- `AUTH_GOOGLE_ID`: Your Google OAuth Client ID
- `AUTH_GOOGLE_SECRET`: Your Google OAuth Client Secret
- `NEXTAUTH_URL`: Your app URL (e.g., `http://localhost:3000` for development)

**Setup instructions:**
See [docs/GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md) for detailed Google OAuth setup instructions.

### Tailwind CSS

The project uses Tailwind CSS v4. Configuration is in:
- `postcss.config.mjs` - PostCSS configuration
- `src/app/index.css` - Tailwind directives

### TypeScript

TypeScript configuration is in `tsconfig.json` with strict mode enabled.

### ESLint

ESLint is configured with Next.js recommended rules in `eslint.config.mjs`.

## Browser Compatibility

- Modern browsers with ES6+ support
- LocalStorage API required for offline sync queue
- Web Speech API for pronunciation (optional)

## Troubleshooting

### Issue: Cannot access the app / Redirected to login page

**Solution**: 
1. Ensure you've set up Google OAuth credentials (see [docs/GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md))
2. Verify your `.env.local` file has all required variables
3. Check that your email is added as a test user in Google Cloud Console (for development apps)
4. Restart the development server after changing `.env.local`

### Issue: "Redirect URI mismatch" error

**Solution**: 
- Verify the redirect URI in Google Cloud Console is exactly: `http://localhost:3000/api/auth/callback/google`
- Check for typos (http vs https, trailing slashes, etc.)

### Issue: Words not saving

**Solution**: Ensure you are signed in, Firebase is configured, and LocalStorage
is enabled for the offline sync queue (avoid incognito/private mode).

### Issue: Translation not working

**Solution**: The app uses Google Translate API. If it fails, it falls back to a built-in dictionary. Check your internet connection.

### Issue: Pronunciation not working

**Solution**: The Web Speech API may not be supported in your browser. Try using Chrome, Edge, or Safari.

### Issue: Build errors

**Solution**: 
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Documentation

Additional documentation available in the `docs/` folder:

- **[Firebase Implementation Guide](docs/FIREBASE_IMPLEMENTATION_GUIDE.md)** - Step-by-step Firestore setup
- **[Migration Guide](docs/MIGRATION_GUIDE.md)** - Migrate localStorage data to Firestore ⭐ NEW
- **[Google OAuth Setup](docs/GOOGLE_OAUTH_SETUP.md)** - Authentication setup guide
- **[Architecture Guide](docs/ARCHITECTURE.md)** - Technical architecture documentation

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**wind2729@gmail.com**

## Acknowledgments

- [Dictionary API](https://dictionaryapi.dev/) for word definitions
- [Google Translate](https://translate.google.com/) for translations
- [Next.js](https://nextjs.org/) team for the amazing framework
- [Vercel](https://vercel.com/) for hosting solutions
