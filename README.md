# Learning English

A modern web application designed to help users learn English vocabulary through interactive word practice and automatic translations.

## Features

- **Google OAuth Authentication**: Secure sign-in with your Google account
- **Add New Words**: Automatically fetch English definitions and Chinese translations
- **Word Validation**: Validates words using dictionary API to ensure they're real English words
- **Interactive Practice**: Quiz-style interface to practice your vocabulary
- **Audio Pronunciation**: Listen to word pronunciations with text-to-speech
- **Persistent Storage**: All words are saved locally in your browser
- **Word Management**: View, add, and delete words from your collection
- **Smart Translations**: Combines English definitions with Chinese translations
- **Infrastructure as Code**: Terraform-based deployment automation with encrypted secrets

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with React 19
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Authentication**: [NextAuth.js v5 (Auth.js)](https://authjs.dev/)
- **State Management**: [MobX](https://mobx.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Infrastructure**: [Terraform](https://www.terraform.io/) for IaC
- **Deployment**: [Vercel](https://vercel.com/) with automated CI/CD
- **Cloud Platform**: [Google Cloud](https://cloud.google.com/) (Secret Manager, Firebase)
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

## Deployment

### Automated Deployment with Terraform

This project uses Infrastructure as Code (IaC) for automated deployment to Vercel with encrypted secrets stored in Google Cloud Secret Manager.

#### Quick Start

1. **Run the setup script** (recommended):
   ```bash
   ./scripts/setup-infrastructure.sh
   ```

2. **Or follow the manual setup**:
   - See [Infrastructure Setup Guide](docs/INFRASTRUCTURE_SETUP.md) for complete instructions
   - See [GitHub Secrets Reference](docs/GITHUB_SECRETS.md) for required secrets

#### Deployment Workflow

Once configured, deployment is automatic:

- **Pull Requests**: Terraform plan validation
- **Merge to Master**: Automatic deployment to Vercel production

#### What Gets Deployed

- **Secrets**: Encrypted in Google Cloud Secret Manager
- **Environment Variables**: Automatically configured in Vercel
- **Application**: Built and deployed to Vercel
- **Infrastructure**: All managed via Terraform

For detailed instructions, see:
- [Infrastructure Setup Guide](docs/INFRASTRUCTURE_SETUP.md)
- [Terraform README](terraform/README.md)

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
│   │   ├── all-words/    # View all words page
│   │   └── layout.tsx    # Root layout
│   ├── components/       # React components
│   │   └── ui/          # UI components (Button, Input, Alert)
│   ├── hooks/           # Custom React hooks
│   │   └── useWords.ts  # Word management hook
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
- **Persistent Storage**: Words are saved in browser localStorage
- **Cloud Storage Option**: Optional Firebase Firestore integration for cross-device sync (see [Cloud Storage Guide](docs/GOOGLE_CLOUD_QUICK_REFERENCE.md))
- **Migration Tool**: Easily migrate existing localStorage data to Firestore (see [Migration Guide](docs/MIGRATION_GUIDE.md))

## Cloud Storage (Optional)

Want to sync your words across devices? Check out our Google Cloud storage guides:

- **[Quick Reference](docs/GOOGLE_CLOUD_QUICK_REFERENCE.md)** - Compare all options (2 min read)
- **[Firebase Firestore Guide](docs/FIREBASE_IMPLEMENTATION_GUIDE.md)** - Step-by-step setup (Recommended, ~45 min)
- **[Migration Guide](docs/MIGRATION_GUIDE.md)** - Move your existing words to the cloud (5 min) ⭐ NEW
- **[Detailed Options](docs/GOOGLE_CLOUD_STORAGE_OPTIONS.md)** - All Google Cloud solutions

**TL;DR**: Use Firebase Firestore (free, real-time sync, easy setup)

## API Integration

The application uses two external APIs:

1. **Dictionary API** (`https://api.dictionaryapi.dev/api/v2/entries/en/{word}`)
   - Purpose: Validate words and fetch English definitions
   - Free tier: No API key required

2. **Google Translate API** (`https://translate.googleapis.com/translate_a/single`)
   - Purpose: Translate English words to Chinese
   - Fallback: Built-in dictionary for common words

## Code Examples

### Using the useWords Hook

```typescript
import { useWords } from "@/hooks";

function MyComponent() {
  const { words, addWord, deleteWord, removeAllWords } = useWords();
  
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
- LocalStorage API required
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

**Solution**: Ensure LocalStorage is enabled in your browser and you're not in incognito/private mode.

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

### Deployment & Infrastructure
- **[Infrastructure Setup Guide](docs/INFRASTRUCTURE_SETUP.md)** - Complete Terraform IaC setup ⭐ NEW
- **[GitHub Secrets Reference](docs/GITHUB_SECRETS.md)** - Quick reference for CI/CD secrets ⭐ NEW

### Cloud Storage & Authentication
- **[Google Cloud Quick Reference](docs/GOOGLE_CLOUD_QUICK_REFERENCE.md)** - Compare storage options
- **[Firebase Implementation Guide](docs/FIREBASE_IMPLEMENTATION_GUIDE.md)** - Step-by-step Firestore setup
- **[Migration Guide](docs/MIGRATION_GUIDE.md)** - Migrate localStorage data to Firestore
- **[Google Cloud Storage Options](docs/GOOGLE_CLOUD_STORAGE_OPTIONS.md)** - Detailed comparison of all options
- **[Google OAuth Setup](docs/GOOGLE_OAUTH_SETUP.md)** - Authentication setup guide

### Technical Documentation
- **[Architecture Guide](docs/ARCHITECTURE.md)** - Technical architecture documentation
- **[Terraform README](terraform/README.md)** - Detailed Terraform documentation

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
