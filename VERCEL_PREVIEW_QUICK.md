# Quick Guide: Testing on Vercel Preview

## 🚀 5-Minute Setup

### 1. Get Your Preview URL
Look for the Vercel bot comment on your PR, or check https://vercel.com/dashboard

Example: `https://learning-english-abc123.vercel.app`

### 2. Add to Google OAuth

Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Your OAuth Client

**Add JavaScript Origin:**
```
https://learning-english-abc123.vercel.app
```

**Add Redirect URI:**
```
https://learning-english-abc123.vercel.app/api/auth/callback/google
```

Click SAVE, wait 2-3 minutes.

### 3. Set Vercel Environment Variables

Go to https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add these for **Preview** environment:
```
AUTH_SECRET=<generate with: openssl rand -base64 32>
AUTH_GOOGLE_ID=<your-google-client-id>
AUTH_GOOGLE_SECRET=<your-google-client-secret>
SKIP_ENV_VALIDATION=true
```

Redeploy after adding variables.

### 4. Test
Visit your preview URL and sign in with Google! 🎉

## 💡 Pro Tips

### Use Branch-Specific URL (Recommended)
Instead of the commit-specific URL that changes, use:
```
https://learning-english-git-<your-branch-name>-<username>.vercel.app
```
This stays the same for all commits on your branch!

### Use Wildcard (If Google Allows)
Add once, works for all preview deployments:
```
JavaScript Origins: https://*.vercel.app
Redirect URIs: https://*.vercel.app/api/auth/callback/google
```

## 🔧 Troubleshooting

| Error | Fix |
|-------|-----|
| "Redirect URI mismatch" | Check exact URL in Google Console, wait 3 mins |
| "Access blocked" | Add yourself as test user in OAuth consent screen |
| "invalid_client" | Check environment variables in Vercel settings |

## 📚 Full Guide

See `docs/VERCEL_PREVIEW_TESTING.md` for complete instructions and advanced options.
