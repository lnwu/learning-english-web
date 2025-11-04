# Learning English

A modern web application designed to help users learn English vocabulary through interactive word practice and automatic translations.

## Features

- **User Authentication**: Secure sign-in with Google OAuth
- **Personal Vocabulary**: Each user has their own word collection stored in the database
- **Add New Words**: Automatically fetch English definitions and Chinese translations
- **Word Validation**: Validates words using dictionary API to ensure they're real English words
- **Interactive Practice**: Quiz-style interface to practice your vocabulary
- **Audio Pronunciation**: Listen to word pronunciations with text-to-speech
- **Persistent Storage**: All words are saved in a PostgreSQL database
- **Word Management**: View, add, and delete words from your collection
- **Smart Translations**: Combines English definitions with Chinese translations

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with React 19
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) with Google OAuth
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **State Management**: [MobX](https://mobx.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Package Manager**: npm
- **Runtime**: Node.js

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18.17 or higher)
- npm (comes with Node.js)
- [PostgreSQL](https://www.postgresql.org/) (version 12 or higher) OR access to a cloud PostgreSQL service

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

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`: Your application URL (http://localhost:3000 for development)
- `GOOGLE_CLIENT_ID`: From Google Cloud Console
- `GOOGLE_CLIENT_SECRET`: From Google Cloud Console

See [DATABASE.md](./DATABASE.md) for detailed database setup instructions.

4. Set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Copy Client ID and Secret to `.env`

5. Set up the database:
```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init
```

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

### Database Management

```bash
# View database in browser
npx prisma studio

# Create a new migration after schema changes
npx prisma migrate dev --name description

# Reset database (warning: deletes all data)
npx prisma migrate reset
```

## Application Structure

```
learning-english/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   │   ├── auth/     # NextAuth.js endpoints
│   │   │   └── words/    # Word CRUD operations
│   │   ├── auth/         # Authentication pages
│   │   │   └── signin/   # Sign-in page
│   │   ├── home/         # Main practice page
│   │   ├── add-word/     # Add new words page
│   │   ├── all-words/    # View all words page
│   │   └── layout.tsx    # Root layout
│   ├── components/       # React components
│   │   ├── providers/    # Context providers
│   │   ├── ui/          # UI components (Button, Input, Alert)
│   │   └── header.tsx   # Header with user info
│   ├── hooks/           # Custom React hooks
│   │   └── useWords.ts  # Word management hook
│   ├── lib/             # Utility functions
│   │   ├── auth/        # Authentication configuration
│   │   └── prisma/      # Prisma client
│   └── types/           # TypeScript type definitions
├── prisma/              # Database schema and migrations
│   └── schema.prisma    # Prisma schema
├── public/              # Static assets
├── .env.example         # Environment variables template
├── DATABASE.md          # Database setup guide
└── package.json         # Project dependencies
```

## How It Works

### Authentication

1. Users sign in with their Google account
2. NextAuth.js handles the OAuth flow
3. User information is stored in the database
4. Protected routes require authentication

### Adding Words

1. Navigate to the "Add New Word" page
2. Enter an English word
3. The app automatically:
   - Validates the word is a real English word
   - Fetches the English definition from [Dictionary API](https://dictionaryapi.dev/)
   - Translates the word to Chinese using Google Translate API
   - Saves both definition and translation to your personal database collection

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
- **Persistent Storage**: Words are saved in a PostgreSQL database with your user account
- **Multi-device Access**: Access your words from any device after signing in

## API Integration

The application uses the following APIs:

1. **Dictionary API** (`https://api.dictionaryapi.dev/api/v2/entries/en/{word}`)
   - Purpose: Validate words and fetch English definitions
   - Free tier: No API key required

2. **Google Translate API** (`https://translate.googleapis.com/translate_a/single`)
   - Purpose: Translate English words to Chinese
   - Fallback: Built-in dictionary for common words

3. **Internal REST API** (Built with Next.js API routes)
   - `GET /api/words` - Fetch user's words
   - `POST /api/words` - Add a new word
   - `DELETE /api/words/:word` - Delete a specific word
   - `DELETE /api/words` - Delete all words

## Code Examples

### Using the useWords Hook

```typescript
import { useWords } from "@/hooks";

function MyComponent() {
  const { words, addWord, deleteWord, removeAllWords } = useWords();
  
  // Add a new word (async - saves to database)
  await addWord("example", "an example definition\n例子");
  
  // Delete a word (async - removes from database)
  await deleteWord("example");
  
  // Access all words
  const allWords = words.allWords;
  
  return <div>Total words: {allWords.size}</div>;
}
```

### Using NextAuth.js Session

```typescript
import { useSession, signIn, signOut } from "next-auth/react";

function ProfileComponent() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") return <button onClick={() => signIn("google")}>Sign in</button>;
  
  return (
    <div>
      <p>Welcome, {session.user.name}!</p>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
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

### Environment Variables

Key environment variables (see `.env.example`):

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### Tailwind CSS

The project uses Tailwind CSS v4. Configuration is in:
- `postcss.config.mjs` - PostCSS configuration
- `src/app/index.css` - Tailwind directives

### TypeScript

TypeScript configuration is in `tsconfig.json` with strict mode enabled.

### ESLint

ESLint is configured with Next.js recommended rules in `eslint.config.mjs`.

### Database

See [DATABASE.md](./DATABASE.md) for comprehensive database setup and management instructions.

## Browser Compatibility

- Modern browsers with ES6+ support
- Cookies enabled (for authentication)
- Web Speech API for pronunciation (optional)

## Troubleshooting

### Authentication Issues

**Issue: Cannot sign in with Google**

**Solution**: 
1. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
2. Check authorized redirect URIs in Google Cloud Console
3. Ensure `NEXTAUTH_URL` matches your application URL
4. Verify `NEXTAUTH_SECRET` is set

### Database Issues

**Issue: Cannot connect to database**

**Solution**: 
1. Verify `DATABASE_URL` is correct in `.env`
2. Ensure PostgreSQL server is running
3. Check database user has proper permissions
4. See [DATABASE.md](./DATABASE.md) for detailed troubleshooting

**Issue: Prisma Client not found**

**Solution**:
```bash
npx prisma generate
```

### Words Not Saving

**Issue: Words not persisting after adding**

**Solution**: 
1. Ensure you're signed in
2. Check database connection
3. Check browser console for API errors
4. Verify database migrations are up to date: `npx prisma migrate deploy`

### Translation Issues

**Issue: Translation not working**

**Solution**: The app uses Google Translate API. If it fails, it falls back to a built-in dictionary. Check your internet connection.

### Pronunciation Issues

**Issue: Pronunciation not working**

**Solution**: The Web Speech API may not be supported in your browser. Try using Chrome, Edge, or Safari.

### Build Errors

**Issue: Build errors**

**Solution**: 
```bash
rm -rf node_modules package-lock.json
npm install
npx prisma generate
npm run build
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Set up Vercel Postgres or connect external database
5. Deploy

### Other Platforms

The app can be deployed to any platform that supports:
- Node.js 18+
- PostgreSQL database
- Environment variables

See [DATABASE.md](./DATABASE.md) for database hosting options.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**wind2729@gmail.com**

## Acknowledgments

- [Dictionary API](https://dictionaryapi.dev/) for word definitions
- [Google Translate](https://translate.google.com/) for translations
- [NextAuth.js](https://next-auth.js.org/) for authentication
- [Prisma](https://www.prisma.io/) for database management
- [Next.js](https://nextjs.org/) team for the amazing framework
- [Vercel](https://vercel.com/) for hosting solutions
