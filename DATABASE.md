# Database Setup Guide

This application uses **PostgreSQL** as its database, managed through **Prisma ORM**. This document explains the database architecture and setup instructions.

## Why PostgreSQL?

PostgreSQL is recommended for this application because:

1. **Production-Ready**: Industry-standard relational database with excellent reliability
2. **Free Hosting Options**: Many cloud platforms offer free PostgreSQL tiers:
   - [Vercel Postgres](https://vercel.com/storage/postgres) - Free tier available
   - [Supabase](https://supabase.com/) - Generous free tier with 500MB database
   - [Railway](https://railway.app/) - Free $5/month credit
   - [Neon](https://neon.tech/) - Serverless Postgres with free tier
   - [ElephantSQL](https://www.elephantsql.com/) - Free 20MB database
3. **Scalability**: Can handle growth from prototype to production
4. **Data Integrity**: ACID compliance ensures your user data is safe
5. **Rich Feature Set**: Supports JSON, full-text search, and advanced queries

## Alternative Database Options

While PostgreSQL is recommended, you can use other databases:

### SQLite (Development Only)
- **Pros**: No setup required, file-based, perfect for local development
- **Cons**: Not recommended for production, limited concurrency
- **Setup**: Change `provider` to `"sqlite"` in `prisma/schema.prisma`

### MySQL/MariaDB
- **Pros**: Widely available, good performance
- **Cons**: Less features than PostgreSQL
- **Setup**: Change `provider` to `"mysql"` in `prisma/schema.prisma`

### MongoDB
- **Pros**: NoSQL flexibility, good for document storage
- **Cons**: Requires schema changes, different querying approach
- **Setup**: Change `provider` to `"mongodb"` in `prisma/schema.prisma`

## Database Schema

The application uses the following tables:

### Users Table (`users`)
Stores user authentication information from Google OAuth.

| Column         | Type      | Description                    |
|----------------|-----------|--------------------------------|
| id             | String    | Primary key (CUID)             |
| name           | String?   | User's display name            |
| email          | String?   | User's email (unique)          |
| emailVerified  | DateTime? | Email verification timestamp   |
| image          | String?   | User's profile picture URL     |
| createdAt      | DateTime  | Account creation timestamp     |
| updatedAt      | DateTime  | Last update timestamp          |

### Accounts Table (`accounts`)
Stores OAuth provider connection details.

| Column            | Type    | Description                      |
|-------------------|---------|----------------------------------|
| id                | String  | Primary key (CUID)               |
| userId            | String  | Foreign key to users             |
| type              | String  | Account type (oauth)             |
| provider          | String  | OAuth provider (google)          |
| providerAccountId | String  | User ID from provider            |
| refresh_token     | String? | OAuth refresh token              |
| access_token      | String? | OAuth access token               |
| expires_at        | Int?    | Token expiration timestamp       |
| token_type        | String? | Token type (Bearer)              |
| scope             | String? | OAuth scopes granted             |
| id_token          | String? | OAuth ID token                   |
| session_state     | String? | OAuth session state              |

### Sessions Table (`sessions`)
Stores active user sessions.

| Column       | Type     | Description                    |
|--------------|----------|--------------------------------|
| id           | String   | Primary key (CUID)             |
| sessionToken | String   | Unique session token           |
| userId       | String   | Foreign key to users           |
| expires      | DateTime | Session expiration             |

### Words Table (`words`)
Stores vocabulary words for each user.

| Column      | Type     | Description                       |
|-------------|----------|-----------------------------------|
| id          | String   | Primary key (CUID)                |
| word        | String   | The English word                  |
| translation | String   | Definition + Chinese translation  |
| userId      | String   | Foreign key to users              |
| createdAt   | DateTime | Word addition timestamp           |
| updatedAt   | DateTime | Last update timestamp             |

**Constraints:**
- Unique constraint on `(userId, word)` - users can't add duplicate words
- Index on `userId` for fast lookups
- Cascade delete - deleting a user deletes their words

### Verification Tokens Table (`verification_tokens`)
For email verification (future use).

| Column     | Type     | Description              |
|------------|----------|--------------------------|
| identifier | String   | User identifier          |
| token      | String   | Verification token       |
| expires    | DateTime | Token expiration         |

## Setup Instructions

### 1. Choose Your Database Provider

#### Option A: Local PostgreSQL (Development)
```bash
# Install PostgreSQL on your system
# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start

# Create database
createdb learning_english
```

#### Option B: Vercel Postgres (Recommended for Deployment)
1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Install Vercel CLI: `npm i -g vercel`
3. Link your project: `vercel link`
4. Create Postgres database: `vercel storage create postgres`
5. Copy the connection string to `.env`

#### Option C: Supabase (Free Tier)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Project Settings → Database
4. Copy the connection string (use "Connection pooling" for better performance)
5. Add to `.env` file

#### Option D: Railway (Simple Setup)
1. Create account at [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL service
4. Copy connection string from Variables tab
5. Add to `.env` file

### 2. Configure Environment Variables

Create `.env` file in the project root (use `.env.example` as template):

```bash
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Copy Client ID and Client Secret to `.env`

### 4. Run Database Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 5. Verify Setup

```bash
# Start development server
npm run dev

# Open http://localhost:3000
# You should see the sign-in page
```

## Prisma Commands

### Development
```bash
# Create migration after schema changes
npx prisma migrate dev --name description_of_changes

# Reset database (deletes all data!)
npx prisma migrate reset

# View database in browser
npx prisma studio

# Regenerate Prisma Client after schema changes
npx prisma generate
```

### Production
```bash
# Apply migrations to production database
npx prisma migrate deploy

# Generate optimized Prisma Client
npx prisma generate
```

## Database Migrations

When you modify `prisma/schema.prisma`:

1. **Create Migration:**
   ```bash
   npx prisma migrate dev --name add_new_field
   ```

2. **Review Generated SQL:**
   Check `prisma/migrations/` folder for SQL files

3. **Apply to Production:**
   ```bash
   npx prisma migrate deploy
   ```

## Backup and Recovery

### Backup Database
```bash
# PostgreSQL
pg_dump -U username -d learning_english > backup.sql

# Restore from backup
psql -U username -d learning_english < backup.sql
```

### Export Data via Prisma
```typescript
// scripts/export-data.ts
import { prisma } from "@/lib/prisma/client";

async function exportData() {
  const users = await prisma.user.findMany({ include: { words: true } });
  console.log(JSON.stringify(users, null, 2));
}
```

## Troubleshooting

### Connection Issues

**Error: "Can't reach database server"**
- Check DATABASE_URL is correct
- Verify database server is running
- Check firewall settings
- Test connection: `psql DATABASE_URL`

**Error: "Authentication failed"**
- Verify username and password in DATABASE_URL
- Check user has proper permissions

### Migration Issues

**Error: "Migration failed to apply"**
- Check database connection
- Review migration SQL in `prisma/migrations/`
- Try: `npx prisma migrate reset` (warning: deletes data)

**Error: "Schema drift detected"**
- Database differs from schema
- Solution: `npx prisma db push` (development only)

### Prisma Client Issues

**Error: "PrismaClient is unable to run in production"**
- Run `npx prisma generate` before deployment
- Ensure `@prisma/client` is in dependencies (not devDependencies)

## Performance Optimization

### Indexes
The schema includes indexes on frequently queried fields:
- `words.userId` - Fast user word lookups
- `users.email` - Fast user authentication

### Connection Pooling
For serverless deployments, consider using:
- [Prisma Data Proxy](https://www.prisma.io/data-platform)
- [PgBouncer](https://www.pgbouncer.org/)
- Provider-specific pooling (e.g., Supabase connection pooling)

### Query Optimization
```typescript
// Good: Include related data in one query
const user = await prisma.user.findUnique({
  where: { id },
  include: { words: true }
});

// Bad: Multiple queries
const user = await prisma.user.findUnique({ where: { id } });
const words = await prisma.word.findMany({ where: { userId: id } });
```

## Security Best Practices

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Use environment variables** - Don't hardcode credentials
3. **Rotate secrets regularly** - Especially NEXTAUTH_SECRET
4. **Use SSL connections** - Add `?sslmode=require` to DATABASE_URL in production
5. **Backup regularly** - Set up automated backups
6. **Monitor access logs** - Track unauthorized access attempts

## Monitoring

### View Database Stats
```sql
-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Active connections
SELECT * FROM pg_stat_activity;
```

### Prisma Studio
Visual database browser:
```bash
npx prisma studio
```

## Migration from localStorage

If you have existing data in localStorage, you can migrate it:

```typescript
// Run this once after authentication
async function migrateLocalStorage() {
  const storedWords = localStorage.getItem("words");
  if (storedWords) {
    const words = JSON.parse(storedWords);
    for (const [word, translation] of words) {
      await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, translation })
      });
    }
    localStorage.removeItem("words"); // Clean up
  }
}
```

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Database Schema Design Guide](https://www.prisma.io/dataguide/datamodeling)

## Support

For issues or questions:
1. Check [Prisma Discord](https://discord.gg/prisma)
2. Review [NextAuth.js Discussions](https://github.com/nextauthjs/next-auth/discussions)
3. Open an issue on the project repository
