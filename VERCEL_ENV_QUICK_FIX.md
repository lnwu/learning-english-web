# Quick Fix: Vercel Environment Variables Not Working

## The Problem
You set environment variables in Vercel dashboard but still getting errors about missing variables.

## The Solution (90% of cases)

### ✅ Step 1: Verify Variables Are Set
Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

Make sure you have:
- `AUTH_SECRET` 
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `SKIP_ENV_VALIDATION` = `true`

### ✅ Step 2: Check Environment Checkboxes
Each variable needs these boxes checked:
- ☑️ **Preview** (for PR deployments)
- ☑️ **Production** (for main branch)

### ✅ Step 3: Redeploy (MOST IMPORTANT!)
**Environment variables only load during deployment!**

```bash
# Force a redeploy
git commit --allow-empty -m "Reload env vars"
git push
```

Or in Vercel Dashboard:
1. Deployments tab
2. Latest deployment → "..." menu
3. Redeploy
4. **UNCHECK** "Use existing Build Cache"
5. Click Redeploy

### ✅ Step 4: Wait for New Deployment
- Don't test the old deployment
- Wait for the new one to finish
- Use the NEW deployment URL

## Still Not Working?

### Debug Checklist

1. **Are variables showing in build logs?**
   - Deployment → Building tab
   - Look for "Detected Environment Variables"
   - Should list AUTH_SECRET, AUTH_GOOGLE_ID, etc.
   - ❌ Not listed? → Go back to Step 2, check environment boxes

2. **Did you redeploy?**
   - Adding variables doesn't update existing deployments
   - You MUST redeploy
   - ❌ Didn't redeploy? → Go back to Step 3

3. **Testing the right URL?**
   - Preview deployments use **Preview** variables
   - Production uses **Production** variables
   - ❌ Wrong environment? → Go back to Step 2

4. **Variable names exactly right?**
   - `AUTH_SECRET` not `AUTH_SECRET_KEY`
   - Case-sensitive
   - No spaces
   - ❌ Typo? → Fix in Settings → Redeploy

5. **SKIP_ENV_VALIDATION set to "true"?**
   - Must be the string `"true"`
   - Check this variable exists
   - ❌ Missing? → Add it → Redeploy

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Set variables but didn't redeploy | Redeploy! |
| Testing old deployment URL | Use the NEW deployment URL after redeploying |
| Only checked "Production" box | Check "Preview" too for PR deployments |
| Variable name typo | Fix in dashboard, then redeploy |
| Forgot `SKIP_ENV_VALIDATION=true` | Add it, then redeploy |

## Quick Verify

Add this file temporarily to check variables:

`src/app/api/check/route.ts`:
```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasSecret: !!process.env.AUTH_SECRET,
    hasGoogleId: !!process.env.AUTH_GOOGLE_ID,
    hasGoogleSecret: !!process.env.AUTH_GOOGLE_SECRET,
    skipValidation: process.env.SKIP_ENV_VALIDATION,
  });
}
```

Visit: `https://your-deployment-url.vercel.app/api/check`

Should show:
```json
{
  "hasSecret": true,
  "hasGoogleId": true,
  "hasGoogleSecret": true,
  "skipValidation": "true"
}
```

If any are `false`, the variable isn't loaded → Go back to Steps 1-4.

**Delete this file after debugging!**

## Need More Help?

See full debugging guide: `docs/DEBUGGING_VERCEL_ENV.md`

Or reply with:
1. Screenshot of Environment Variables page (hide secrets)
2. Screenshot of build logs showing "Detected Environment Variables"
3. Exact error message
4. Deployment URL you're testing

---

**TL;DR: Set variables → Check Preview/Production boxes → REDEPLOY → Test NEW deployment**
