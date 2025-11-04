# What's New: Authentication & Database

## Overview

This version introduces **user authentication with Google** and **database-backed storage**, replacing the previous localStorage-based approach.

## Key Changes

### 🔐 Authentication Required

- **Google Sign-In**: You must sign in with your Google account to use the app
- **Personal Account**: Each user has their own isolated word collection
- **Secure**: Your data is protected and only accessible when you're signed in
- **Multi-Device**: Access your words from any device after signing in

### 💾 Database Storage

- **Persistent**: Words are now stored in a PostgreSQL database
- **Reliable**: No risk of losing data when clearing browser cache
- **Scalable**: No browser storage limits
- **Backed Up**: Data can be backed up and restored easily

### 🏗️ Architecture Changes

**Before:**
- Words stored in browser localStorage
- No authentication
- Single device only
- Risk of data loss

**After:**
- Words stored in PostgreSQL database
- Google OAuth authentication
- Multi-device access
- Secure and persistent

## For Existing Users

If you were using the old version:

1. **Your data is safe**: localStorage data remains in your browser
2. **Migration available**: See [MIGRATION.md](./MIGRATION.md) for migration guide
3. **No rush**: You can keep using the old version while you migrate
4. **Fresh start option**: Or start fresh with better word fetching

## New Features

### User Interface

- **Header Bar**: Shows your profile picture and name
- **Sign Out**: Easy sign-out button in the header
- **Loading States**: Better feedback when loading words
- **Empty States**: Clear guidance when you have no words yet

### Under the Hood

- **API Routes**: RESTful API for word management
- **Session Management**: Secure session handling
- **Protected Routes**: Authentication required for all pages
- **Type Safety**: Full TypeScript support

## Getting Started

### New Users

1. Open the app
2. Click "Sign in with Google"
3. Authorize the application
4. Start adding words!

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Existing Users

1. Set up the new version (see [SETUP.md](./SETUP.md))
2. Sign in with Google
3. Migrate your words (see [MIGRATION.md](./MIGRATION.md))
4. Continue learning!

## Technical Stack

### New Dependencies

- **NextAuth.js v5**: Authentication with Google OAuth
- **Prisma v6**: Modern ORM for PostgreSQL
- **@prisma/client**: Database client
- **@auth/prisma-adapter**: Prisma adapter for NextAuth

### Database Schema

- **users**: User accounts and profiles
- **accounts**: OAuth provider connections
- **sessions**: Active user sessions
- **words**: Vocabulary words (one-to-many with users)
- **verification_tokens**: For future email verification

## Benefits

### For Users

✅ **Security**: Your data is protected by Google authentication  
✅ **Accessibility**: Access from any device  
✅ **Reliability**: No more lost data from cleared cache  
✅ **Privacy**: Your words are isolated from other users  
✅ **Backup**: Data can be backed up professionally

### For Developers

✅ **Scalable**: Database can handle millions of words  
✅ **Maintainable**: Clean API architecture  
✅ **Type-Safe**: Full TypeScript coverage  
✅ **Modern**: Uses latest Next.js and React features  
✅ **Testable**: API routes easy to test

## Breaking Changes

### What Changed

1. **Authentication Required**: No anonymous usage
2. **LocalStorage Removed**: Data must be migrated
3. **New API Routes**: Internal API changed
4. **Database Required**: PostgreSQL needed for deployment

### Backward Compatibility

❌ **Not compatible** with old localStorage data automatically  
✅ **Migration available** via browser console or script  
✅ **Old version** can still be used alongside

## Performance

- **Faster**: Database queries optimized with indexes
- **Efficient**: Only loads data when needed
- **Cached**: Session data cached in memory
- **Responsive**: API routes are fast

## Security

### What We Protect

✅ OAuth tokens encrypted  
✅ Session cookies secure and httpOnly  
✅ API routes authenticated  
✅ User data isolated  
✅ SQL injection prevented (Prisma ORM)

### What You Should Do

⚠️ Never commit `.env` file  
⚠️ Use strong NEXTAUTH_SECRET  
⚠️ Rotate secrets if exposed  
⚠️ Use HTTPS in production

## Database Providers

Choose from multiple free options:

1. **Vercel Postgres** ⭐ Recommended for Vercel deployment
2. **Supabase** ⭐ Best free tier (500MB)
3. **Railway** - Developer-friendly
4. **Neon** - Serverless Postgres
5. **Local PostgreSQL** - For development

See [DATABASE.md](./DATABASE.md) for setup instructions.

## Documentation

We've created comprehensive guides:

- **[SETUP.md](./SETUP.md)** - Quick start guide (5 minutes)
- **[DATABASE.md](./DATABASE.md)** - Complete database guide
- **[MIGRATION.md](./MIGRATION.md)** - Migration from localStorage
- **[README.md](./README.md)** - Full documentation

## Support

Need help?

1. Check [SETUP.md](./SETUP.md) for common issues
2. See [DATABASE.md](./DATABASE.md) for database problems
3. Review [MIGRATION.md](./MIGRATION.md) for migration issues
4. Open an issue on GitHub

## Roadmap

Future enhancements planned:

- [ ] Word practice statistics
- [ ] Spaced repetition algorithm
- [ ] Study sessions and goals
- [ ] Import/export word lists
- [ ] Audio pronunciation history
- [ ] Mobile app (React Native)

## Frequently Asked Questions

### Do I need to keep my browser open?

No! Your data is stored in the database, not your browser.

### Can I use multiple devices?

Yes! Sign in with the same Google account on any device.

### What happens if I clear my browser data?

Nothing! Your words are in the database, not your browser.

### Is my data private?

Yes! Your words are only visible to you after signing in.

### Can I export my data?

Yes! Use Prisma Studio (`npx prisma studio`) to export.

### What if I lose access to my Google account?

Contact support for account recovery options.

### Does this cost money?

The app is free. Database hosting has free tiers (see DATABASE.md).

### Can I self-host?

Yes! Deploy anywhere that supports Node.js and PostgreSQL.

## Comparison

| Feature | Old Version | New Version |
|---------|-------------|-------------|
| Authentication | None | Google OAuth |
| Storage | localStorage | PostgreSQL |
| Multi-device | ❌ No | ✅ Yes |
| Data persistence | Browser only | Server database |
| Data loss risk | High | Very low |
| Storage limit | ~5-10MB | Unlimited* |
| User accounts | ❌ No | ✅ Yes |
| API | None | REST API |
| Deployment | Static | Server + DB |

*Subject to database provider limits

## Credits

This version uses:

- [NextAuth.js](https://next-auth.js.org/) for authentication
- [Prisma](https://www.prisma.io/) for database management
- [PostgreSQL](https://www.postgresql.org/) for data storage
- [Google OAuth](https://developers.google.com/identity/protocols/oauth2) for sign-in

## Version

- **Version**: 2.0.0
- **Release Date**: 2024
- **Status**: Stable
- **Minimum Node.js**: 18.17+
- **Database**: PostgreSQL 12+

## License

MIT License - see [LICENSE](./LICENSE)

---

**Ready to get started?** See [SETUP.md](./SETUP.md) for setup instructions!
