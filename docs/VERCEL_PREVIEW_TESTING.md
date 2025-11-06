# Testing Google OAuth on Vercel Preview Deployment

When you deploy to Vercel, each PR gets a unique preview URL. Here's how to test Google OAuth on your preview deployment.

## Understanding Vercel Preview URLs

Vercel generates preview URLs in this format:
- `https://learning-english-<hash>.vercel.app`
- `https://learning-english-git-<branch-name>-<username>.vercel.app`

Each deployment has its own unique URL, so you need to configure Google OAuth for it.

## Quick Setup (5 minutes)

### Step 1: Get Your Vercel Preview URL

1. Check your PR on GitHub
2. Look for the Vercel bot comment with deployment URLs
3. Copy the preview URL (example: `https://learning-english-abc123.vercel.app`)

Or find it in Vercel dashboard:
1. Go to https://vercel.com/dashboard
2. Find your project "learning-english"
3. Click on the latest deployment
4. Copy the domain URL

### Step 2: Add Preview URL to Google OAuth

Go to [Google Cloud Console](https://console.cloud.google.com/):

1. Navigate to **APIs & Services** → **Credentials**
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized JavaScript origins**, click **ADD URI**:
   - Add: `https://learning-english-abc123.vercel.app` (your actual preview URL)
4. Under **Authorized redirect URIs**, click **ADD URI**:
   - Add: `https://learning-english-abc123.vercel.app/api/auth/callback/google`
5. Click **SAVE**
6. Wait 2-3 minutes for changes to propagate

### Step 3: Set Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your "learning-english" project
3. Go to **Settings** → **Environment Variables**
4. Add these variables (if not already set):
   - `AUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `AUTH_GOOGLE_ID`: Your Google Client ID
   - `AUTH_GOOGLE_SECRET`: Your Google Client Secret
   - `SKIP_ENV_VALIDATION`: Set to `true` (for builds)

**Important:** Make sure to select the correct environment:
- ✅ **Preview** (for PR deployments)
- ✅ **Production** (if also testing on main branch)

5. Click **Save**
6. Redeploy your PR for changes to take effect

### Step 4: Test Your Preview

1. Visit your preview URL: `https://learning-english-abc123.vercel.app`
2. You should be redirected to the login page
3. Click "Sign in with Google"
4. Complete the OAuth flow
5. You should be redirected back and authenticated! 🎉

## Option 2: Use Wildcard Domain (Recommended for Multiple PRs)

If you test many PRs, use a wildcard to avoid adding each preview URL:

### Setup Wildcard

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID

**For Authorized JavaScript origins:**
- Remove: `https://learning-english-abc123.vercel.app`
- Add: `https://*.vercel.app`

**For Authorized redirect URIs:**
- Remove: `https://learning-english-abc123.vercel.app/api/auth/callback/google`
- Add: `https://*.vercel.app/api/auth/callback/google`

**Note:** Some OAuth providers don't allow wildcards. If Google rejects it, you'll need to add each preview URL individually (Option 1).

## Option 3: Use Custom Domain with Vercel

If you have a custom domain, use branch-specific subdomains:

### Setup in Vercel:
1. Go to **Settings** → **Domains**
2. Add domain: `preview.yourdomain.com`
3. Configure to deploy PRs to: `<branch>.preview.yourdomain.com`

### Setup in Google OAuth:
1. **Authorized JavaScript origins:**
   - Add: `https://*.preview.yourdomain.com`
2. **Authorized redirect URIs:**
   - Add: `https://*.preview.yourdomain.com/api/auth/callback/google`

Now each PR automatically gets: `https://pr-branch-name.preview.yourdomain.com`

## Troubleshooting

### Error: "Redirect URI mismatch"

**Problem:** Google OAuth can't redirect back to your preview URL.

**Solution:**
1. Double-check the redirect URI in Google Console matches exactly
2. Format: `https://your-exact-preview-url.vercel.app/api/auth/callback/google`
3. No trailing slashes
4. Wait 2-3 minutes after adding for changes to propagate

### Error: "Access blocked: This app's request is invalid"

**Problem:** OAuth consent screen or credentials not properly configured.

**Solution:**
1. Ensure you added your email as a test user
2. Check OAuth consent screen is fully configured
3. Verify the preview URL is in authorized origins

### Error: "invalid_client" or authentication fails silently

**Problem:** Environment variables not set correctly in Vercel.

**Solution:**
1. Go to Vercel → Settings → Environment Variables
2. Verify AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET are set
3. Ensure AUTH_SECRET is set (generate with `openssl rand -base64 32`)
4. Make sure variables are enabled for "Preview" environment
5. Redeploy after adding/changing environment variables

### Preview URL keeps changing

**Problem:** Each new commit gets a new deployment URL.

**Solution:**
- Use the branch-specific URL instead: `https://learning-english-git-<branch-name>-<username>.vercel.app`
- This URL stays the same for all commits on that branch
- Add this URL to Google OAuth instead of the commit-specific URL

## Testing Multiple Branches

If you frequently test different PRs:

1. **Use Vercel CLI** to get consistent preview URLs:
   ```bash
   npm i -g vercel
   vercel link
   vercel env pull .env.local
   ```

2. **Add all branch URLs** to Google OAuth:
   - `https://learning-english-git-main-username.vercel.app`
   - `https://learning-english-git-feature-branch-username.vercel.app`
   - etc.

3. **Or use wildcard** (if Google allows):
   - `https://*.vercel.app`

## Best Practices

1. **Use separate OAuth credentials for preview vs production**
   - Create different OAuth clients in Google Console
   - One for development/preview (`*.vercel.app`)
   - One for production (your custom domain)

2. **Set environment variables at project level**
   - Configure once in Vercel project settings
   - All preview deployments automatically use them

3. **Test on stable branch URL**
   - Use `https://learning-english-git-<branch>.vercel.app`
   - Doesn't change with new commits
   - Easier to configure in Google OAuth

4. **Keep test users updated**
   - Add team members as test users in Google OAuth consent screen
   - They can test preview deployments without making the app public

## Quick Reference

### URLs You Need

| Type | Format | Example |
|------|--------|---------|
| Commit-specific | `learning-english-<hash>.vercel.app` | `learning-english-abc123.vercel.app` |
| Branch-specific | `learning-english-git-<branch>-<user>.vercel.app` | `learning-english-git-main-myuser.vercel.app` |
| Custom domain | `<branch>.preview.yourdomain.com` | `pr-10.preview.yourdomain.com` |

### Google OAuth Setup

**JavaScript Origins:** `https://your-preview-url.vercel.app`

**Redirect URIs:** `https://your-preview-url.vercel.app/api/auth/callback/google`

### Vercel Environment Variables

Required for preview:
- `AUTH_SECRET` (generate new for preview)
- `AUTH_GOOGLE_ID` (from Google Console)
- `AUTH_GOOGLE_SECRET` (from Google Console)
- `SKIP_ENV_VALIDATION=true` (for builds)

## Summary

**For quick one-time testing:**
1. Get preview URL from PR
2. Add to Google OAuth (origins + callback)
3. Test within 3 minutes

**For ongoing development:**
1. Use wildcard domain in Google OAuth
2. Set environment variables in Vercel project settings
3. All PRs automatically work

**Need help?** Check the main setup guide: `docs/GOOGLE_OAUTH_SETUP.md`
