# Debugging Vercel Environment Variables

If you're seeing errors about missing environment variables even after setting them in Vercel dashboard, follow these debugging steps:

## Quick Checklist

### 1. Verify Environment Variables Are Set Correctly

Go to your Vercel project → **Settings** → **Environment Variables**

Check that ALL of these are set:
- ✅ `AUTH_SECRET` - Your generated secret
- ✅ `AUTH_GOOGLE_ID` - Your Google Client ID
- ✅ `AUTH_GOOGLE_SECRET` - Your Google Client Secret
- ✅ `SKIP_ENV_VALIDATION` - Set to `true`

**Important:** Make sure they're checked for the right environment:
- ✅ **Preview** (for PR deployments)
- ✅ **Production** (if deploying to main)
- ⚠️ **Development** (optional, for local `vercel dev`)

### 2. Redeploy After Adding Variables

**Critical:** Environment variables are only loaded during build/deployment.

After adding or changing variables:

**Option A: Via GitHub (Recommended)**
```bash
# Make any small change to trigger redeploy
git commit --allow-empty -m "Trigger redeploy for env vars"
git push
```

**Option B: Via Vercel Dashboard**
1. Go to your project's **Deployments** tab
2. Find the latest deployment
3. Click the "..." menu
4. Click **Redeploy**
5. Check "Use existing Build Cache" is UNCHECKED
6. Click **Redeploy**

**Option C: Via Vercel CLI**
```bash
vercel --prod  # or vercel for preview
```

### 3. Check Which Environment the Deployment Is Using

Look at your deployment URL:
- `learning-english-git-<branch>.vercel.app` → Uses **Preview** environment
- `your-domain.com` or production URL → Uses **Production** environment

Make sure variables are set for the matching environment!

### 4. Verify Variables Are Actually Present

**Method 1: Check Build Logs**

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the failing deployment
3. Click **Building** tab
4. Look for this section near the top:
   ```
   Detected Environment Variables
   - AUTH_SECRET
   - AUTH_GOOGLE_ID
   - AUTH_GOOGLE_SECRET
   ```

If your variables don't appear here, they're not being loaded!

**Method 2: Add a Debug Endpoint** (Temporary)

Create `src/app/api/debug-env/route.ts`:
```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasGoogleId: !!process.env.AUTH_GOOGLE_ID,
    hasGoogleSecret: !!process.env.AUTH_GOOGLE_SECRET,
    skipValidation: process.env.SKIP_ENV_VALIDATION,
    nodeEnv: process.env.NODE_ENV,
  });
}
```

Deploy and visit: `https://your-preview-url.vercel.app/api/debug-env`

Expected output:
```json
{
  "hasAuthSecret": true,
  "hasGoogleId": true,
  "hasGoogleSecret": true,
  "skipValidation": "true",
  "nodeEnv": "production"
}
```

**⚠️ Delete this file after debugging!** Don't leave it in production.

### 5. Common Issues & Fixes

#### Issue: Variables Not Loading

**Symptoms:**
- Build logs don't show your variables
- Debug endpoint shows `false` for all variables

**Solutions:**

**A. Wrong Environment Selected**
- Go to Settings → Environment Variables
- Check the environment checkboxes (Preview/Production)
- Variables must be checked for the environment you're deploying to

**B. Variables Have Typos**
- Verify exact names: `AUTH_SECRET` (not `AUTH_SECRET_KEY` or `NEXT_PUBLIC_AUTH_SECRET`)
- Names are case-sensitive
- No extra spaces in names or values

**C. Using Legacy Interface**
- Some Vercel projects use legacy environment variable interface
- Try: Settings → Environment Variables → Click "Switch to new interface"

#### Issue: Variables Load But Still Get Errors

**Symptoms:**
- Variables appear in build logs
- Debug endpoint shows `true`
- Still get "Missing AUTH_GOOGLE_ID" error

**Solutions:**

**A. Build Cache Issue**
- Redeploy with cache disabled:
  1. Deployments → Latest deployment → "..." → Redeploy
  2. **Uncheck** "Use existing Build Cache"
  3. Redeploy

**B. Validation Running When It Shouldn't**
- Check `SKIP_ENV_VALIDATION` is set to `"true"` (string, not boolean)
- Check it's set for the correct environment
- Verify in build logs it shows: `SKIP_ENV_VALIDATION=true`

**C. Edge Runtime Issue**
- If using Edge Runtime, environment variables work differently
- Our middleware uses Edge Runtime
- Solution: Ensure variables are set at project level, not just deployment level

#### Issue: Works Locally, Fails on Vercel

**Symptoms:**
- `npm run dev` works fine locally
- Vercel deployment fails with env var errors

**Solutions:**

**A. Local vs. Vercel Variables**
- Local: Uses `.env.local` file
- Vercel: Uses project environment variables
- These are completely separate!
- You must set them in Vercel dashboard separately

**B. Different Validation Logic**
- Check `src/auth.ts` line 9:
  ```typescript
  if (process.env.NODE_ENV !== "production" && process.env.SKIP_ENV_VALIDATION !== "true")
  ```
- On Vercel, `NODE_ENV` is always `"production"`
- So validation is skipped IF `SKIP_ENV_VALIDATION=true`

**C. Runtime vs. Build Time**
- Some variables needed at BUILD time
- Some needed at RUNTIME
- NextAuth needs them at RUNTIME
- Vercel provides them for both if set correctly

### 6. Detailed Debugging Steps

If issues persist, follow these steps:

**Step 1: Clean Slate**
1. Delete ALL environment variables for your project
2. Wait 1 minute
3. Re-add them one by one:
   ```
   AUTH_SECRET=<paste your secret>
   AUTH_GOOGLE_ID=<paste your client ID>
   AUTH_GOOGLE_SECRET=<paste your secret>
   SKIP_ENV_VALIDATION=true
   ```
4. For each variable:
   - Check **Preview** environment
   - Check **Production** environment (if needed)

**Step 2: Verify in Dashboard**
After adding, you should see something like:
```
Variable Name              | Value           | Environments
AUTH_SECRET                | ••••••••••••   | Preview, Production
AUTH_GOOGLE_ID             | 123456••••.app | Preview, Production
AUTH_GOOGLE_SECRET         | GOCSPX-•••••   | Preview, Production
SKIP_ENV_VALIDATION        | true           | Preview, Production
```

**Step 3: Force New Deployment**
```bash
# Commit something to trigger rebuild
echo "# Debug" >> README.md
git add README.md
git commit -m "Test env vars"
git push
```

**Step 4: Check Build Output**
1. Watch the deployment in real-time
2. Look for "Detected Environment Variables" section
3. Should list all 4 variables

**Step 5: Test the Deployment**
Visit your deployment URL. If you still get errors, continue to Step 6.

**Step 6: Check Runtime Logs**
1. Vercel Dashboard → Your Project → Logs
2. Filter by your deployment
3. Look for runtime errors
4. Check if variables are actually `undefined` at runtime

### 7. Alternative: Use Vercel CLI

Sometimes the dashboard has issues. Try CLI instead:

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
cd /path/to/learning-english
vercel link

# Add environment variables via CLI
vercel env add AUTH_SECRET
# Paste value when prompted
# Select "Preview" and "Production"

vercel env add AUTH_GOOGLE_ID
# Paste value

vercel env add AUTH_GOOGLE_SECRET
# Paste value

vercel env add SKIP_ENV_VALIDATION
# Enter: true

# List to verify
vercel env ls

# Deploy
vercel --prod
```

### 8. Nuclear Option: Recreate Project

If nothing works, recreate the Vercel project:

1. **Export current settings** (take screenshots of env vars)
2. Delete project from Vercel
3. Re-import from GitHub
4. Set environment variables
5. Deploy

## Still Having Issues?

### What to Share When Asking for Help:

1. **Screenshot of Environment Variables page** (hide actual secrets)
2. **Build logs** (especially "Detected Environment Variables" section)
3. **Exact error message** you're seeing
4. **Deployment URL** you're testing
5. **Output of debug endpoint** (if you added it)

### Quick Test Script

Run this to verify your Vercel setup:

```bash
# Check project is linked
vercel whoami

# Check environment variables
vercel env ls

# Check which deployment you're testing
vercel ls

# Get logs for latest deployment
vercel logs <deployment-url>
```

## Most Common Solution

**95% of the time, this fixes it:**

1. ✅ Set variables in Vercel dashboard
2. ✅ Check **Preview** AND **Production** boxes
3. ✅ **Redeploy** (don't skip this!)
4. ✅ Wait for deployment to complete
5. ✅ Test the NEW deployment URL

The key is redeploying after setting variables!

## Prevention for Future

**Best Practice:**
1. Set environment variables BEFORE first deployment
2. Use the same variable names everywhere (local, Vercel, docs)
3. Document your variables in `.env.example`
4. Always redeploy after changing variables
5. Use Vercel CLI for complex setups

---

**Need more help?** Reply with:
- Screenshot of your Environment Variables page
- The exact error message
- Your deployment URL
- Build logs from the failing deployment
