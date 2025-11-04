# Quick Setup Guide

This guide will help you get the Learning English application running locally in just a few minutes.

## Prerequisites

- Node.js 18.17+ installed
- PostgreSQL database (local or cloud)
- Google account for OAuth setup

## Step-by-Step Setup

### 1. Clone and Install

```bash
git clone https://github.com/lnwu/learning-english.git
cd learning-english
npm install
```

### 2. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Google+ API**:
   - Click "Enable APIs and Services"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Configure consent screen if prompted
   - Application type: **Web application**
   - Name: "Learning English" (or your choice)
   - Authorized redirect URIs:
     - Development: `http://localhost:3000/api/auth/callback/google`
     - Production: `https://yourdomain.com/api/auth/callback/google`
   - Click "Create"
   - **Copy the Client ID and Client Secret** (you'll need these next)

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```bash
# Database - Choose one option:

# Option A: Local PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/learning_english"

# Option B: Vercel Postgres (after running: vercel storage create postgres)
# DATABASE_URL="postgres://..."

# Option C: Supabase (get from: Project Settings → Database → Connection string)
# DATABASE_URL="postgresql://..."

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="paste-your-generated-secret-here"

# Your app URL
NEXTAUTH_URL="http://localhost:3000"

# From Google Cloud Console (step 2)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Set Up Database

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL (if not already installed)
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# Start PostgreSQL
# macOS: brew services start postgresql
# Ubuntu: sudo service postgresql start

# Create database
createdb learning_english

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/learning_english"
```

#### Option B: Cloud Database (Recommended)

**Using Supabase (Free):**
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to: Project Settings → Database
4. Copy "Connection string" (URI format)
5. Paste into `.env` as `DATABASE_URL`

**Using Vercel Postgres:**
```bash
npm i -g vercel
vercel link
vercel storage create postgres
# Copy the DATABASE_URL to .env
```

### 5. Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init
```

You should see output like:
```
✔ Generated Prisma Client
✔ The migration has been applied successfully
```

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Verify Setup

1. You should see the sign-in page
2. Click "Sign in with Google"
3. Authorize the application
4. You should be redirected to the home page
5. Try adding a word to test the full flow

## Common Issues

### "Can't reach database server"

**Solution:** Check your `DATABASE_URL` in `.env`. Test connection:
```bash
psql "YOUR_DATABASE_URL"
```

### "Invalid client ID or secret"

**Solution:** Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env` match Google Cloud Console.

### "Prisma Client not found"

**Solution:** Run:
```bash
npx prisma generate
```

### "Migration failed"

**Solution:** Reset and try again:
```bash
npx prisma migrate reset
npx prisma migrate dev --name init
```

## Next Steps

- **View your data:** Run `npx prisma studio` to open a visual database browser
- **Add words:** Navigate to "Add New Word" page
- **Practice:** Go to "Practice Vocabulary" to test your words
- **Deploy:** See README.md for deployment instructions

## Quick Database Commands

```bash
# View database in browser
npx prisma studio

# See all migrations
ls prisma/migrations/

# Check migration status
npx prisma migrate status

# Reset database (deletes all data!)
npx prisma migrate reset
```

## Development Tips

- Keep `npx prisma studio` open to monitor database changes
- Check browser console for API errors
- Use the Header sign-out button to test re-authentication
- Test with multiple Google accounts to verify user isolation

## Resources

- [Full README](./README.md) - Complete documentation
- [Database Guide](./DATABASE.md) - Detailed database setup and troubleshooting
- [NextAuth.js Docs](https://next-auth.js.org/) - Authentication documentation
- [Prisma Docs](https://www.prisma.io/docs) - Database ORM documentation

## Need Help?

1. Check [DATABASE.md](./DATABASE.md) for database-specific issues
2. Review [README.md](./README.md) troubleshooting section
3. Open an issue on GitHub with:
   - Error messages
   - Steps to reproduce
   - Your environment (OS, Node version)

## Security Reminder

- Never commit `.env` file (it's in `.gitignore`)
- Keep your `NEXTAUTH_SECRET` secure
- Rotate secrets if exposed
- Use environment variables in production
