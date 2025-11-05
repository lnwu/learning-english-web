# Quick Start Guide - Google OAuth Setup

This is a condensed version of the full setup guide. For detailed instructions, see [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md).

## 5-Minute Setup

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Select **External** user type
5. Fill in required fields (App name, support email, developer email)
6. Add test users (your email address)

### 2. Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **CREATE CREDENTIALS** → **OAuth client ID**
3. Select **Web application**
4. Add Authorized JavaScript origins:
   - `http://localhost:3000`
5. Add Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
6. Click **CREATE**
7. Copy the **Client ID** and **Client Secret**

### 3. Configure Your App

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` and add your credentials:
```bash
# Generate this with: openssl rand -base64 32
AUTH_SECRET=paste-generated-secret-here

# From Google Cloud Console
AUTH_GOOGLE_ID=paste-client-id-here
AUTH_GOOGLE_SECRET=paste-client-secret-here

# For local development
NEXTAUTH_URL=http://localhost:3000
```

3. Generate AUTH_SECRET:
```bash
openssl rand -base64 32
```
Copy the output and paste it as the `AUTH_SECRET` value.

### 4. Start the App

```bash
npm install
npm run dev
```

Open http://localhost:3000 and sign in with Google!

## Common Issues

### "Redirect URI mismatch"
- Double-check the redirect URI is exactly: `http://localhost:3000/api/auth/callback/google`
- No trailing slashes
- http (not https) for localhost

### "Access blocked"
- Make sure you added your email as a test user in the OAuth consent screen
- Wait a few minutes for changes to propagate

### "invalid_client"
- Verify there are no extra spaces in your `.env.local` file
- Make sure you copied the Client ID and Client Secret correctly

## Next Steps

- Read the full guide: [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)
- For production deployment, see the Production section in the full guide
