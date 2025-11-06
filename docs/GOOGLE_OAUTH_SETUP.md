# Google OAuth Setup Guide

This guide will walk you through setting up Google OAuth authentication for the Learning English application.

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click **"NEW PROJECT"**
4. Enter a project name (e.g., "Learning English App")
5. Click **"CREATE"**
6. Wait for the project to be created, then select it from the project dropdown

### 2. Configure OAuth Consent Screen

1. In the left sidebar, navigate to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** user type (unless you have a Google Workspace account)
3. Click **"CREATE"**

#### Fill in the required information:

**App information:**
- **App name**: Learning English
- **User support email**: Your email address
- **App logo** (optional): You can skip this for now

**App domain (optional):**
- You can skip these for development

**Developer contact information:**
- **Email addresses**: Your email address

4. Click **"SAVE AND CONTINUE"**

#### Scopes:

5. Click **"ADD OR REMOVE SCOPES"**
6. Select these scopes:
   - `openid`
   - `email`
   - `profile`
7. Click **"UPDATE"**
8. Click **"SAVE AND CONTINUE"**

#### Test users (for External apps in development):

9. Click **"ADD USERS"**
10. Add your email address and any other test users
11. Click **"ADD"**
12. Click **"SAVE AND CONTINUE"**

13. Review the summary and click **"BACK TO DASHBOARD"**

### 3. Create OAuth 2.0 Credentials

1. In the left sidebar, navigate to **"APIs & Services"** → **"Credentials"**
2. Click **"CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**

#### Configure the OAuth client:

4. **Application type**: Select **"Web application"**
5. **Name**: Enter a name (e.g., "Learning English Web Client")

6. **Authorized JavaScript origins**: Click **"ADD URI"** and add:
   - For development: `http://localhost:3000`
   - For production: Your production domain (e.g., `https://your-domain.com`)

7. **Authorized redirect URIs**: Click **"ADD URI"** and add:
   - For development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://your-domain.com/api/auth/callback/google`

8. Click **"CREATE"**

### 4. Save Your Credentials

A dialog will appear with your credentials:
- **Client ID**: Something like `123456789-abcdefg.apps.googleusercontent.com`
- **Client Secret**: A random string

**Important**: Copy these credentials immediately. You won't be able to see the Client Secret again.

### 5. Configure Your Application

1. In your project root, create a `.env.local` file (do NOT commit this file):

```bash
# Generate a random secret (run this command in your terminal):
# openssl rand -base64 32

AUTH_SECRET=your-generated-secret-here
AUTH_GOOGLE_ID=your-client-id-from-google
AUTH_GOOGLE_SECRET=your-client-secret-from-google
```

**Note:** NextAuth.js v5 automatically detects the URL in local development. Only add `NEXTAUTH_URL` for production deployments or when behind a proxy.

2. Replace the placeholder values:
   - `AUTH_SECRET`: Generate one using `openssl rand -base64 32` in your terminal
   - `AUTH_GOOGLE_ID`: Paste the Client ID from Google
   - `AUTH_GOOGLE_SECRET`: Paste the Client Secret from Google

### 6. Verify Setup

1. Start your development server:
```bash
npm run dev
```

2. Open your browser and go to `http://localhost:3000`

3. You should be redirected to the login page

4. Click **"Sign in with Google"**

5. You should be redirected to Google's sign-in page

6. Sign in with your Google account

7. Grant the requested permissions

8. You should be redirected back to your app and signed in!

## Production Deployment

When deploying to production:

1. Update your OAuth client in Google Cloud Console:
   - Add your production domain to **Authorized JavaScript origins**
   - Add your production callback URL to **Authorized redirect URIs**

2. Update your environment variables on your hosting platform:
   - Set `AUTH_SECRET` (generate a new one for production)
   - Set `AUTH_GOOGLE_ID`
   - Set `AUTH_GOOGLE_SECRET`
   - Set `NEXTAUTH_URL` to your production URL

3. Publish your OAuth consent screen (if using External user type):
   - Go to **OAuth consent screen** in Google Cloud Console
   - Click **"PUBLISH APP"**
   - Note: Google may require verification if you request sensitive scopes

## Troubleshooting

### Error: "Redirect URI mismatch"

**Problem**: The redirect URI in your request doesn't match any registered URIs.

**Solution**:
- Verify the redirect URI in Google Cloud Console matches exactly: `http://localhost:3000/api/auth/callback/google`
- Check for typos (http vs https, trailing slashes, etc.)
- Wait a few minutes for changes to propagate

### Error: "Access blocked: This app's request is invalid"

**Problem**: OAuth consent screen not properly configured.

**Solution**:
- Ensure you've completed the OAuth consent screen setup
- Add yourself as a test user if the app is in development mode
- Verify all required fields are filled in

### Error: "invalid_client"

**Problem**: Client ID or Client Secret is incorrect.

**Solution**:
- Double-check your `.env.local` file
- Ensure there are no extra spaces or quotes around the values
- Regenerate credentials if needed

### Sign-in works but redirects to wrong page

**Problem**: `NEXTAUTH_URL` is not set correctly.

**Solution**:
- Verify `NEXTAUTH_URL` in `.env.local` matches your current environment
- For development: `http://localhost:3000`
- For production: Your production URL

## Security Best Practices

1. **Never commit `.env.local` or any file containing secrets to version control**
2. **Use different credentials for development and production**
3. **Rotate secrets regularly**
4. **Restrict API access** - Only enable the APIs you need in Google Cloud Console
5. **Monitor usage** - Check Google Cloud Console for unusual activity
6. **Use strong AUTH_SECRET** - Always generate it using `openssl rand -base64 32`

## Additional Resources

- [NextAuth.js Documentation](https://authjs.dev/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

## Support

If you encounter issues not covered in this guide, please:
1. Check the [NextAuth.js Documentation](https://authjs.dev/)
2. Review error messages in your browser console and server logs
3. Open an issue in the GitHub repository with detailed error information
