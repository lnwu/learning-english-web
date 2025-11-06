# ⭐ RECOMMENDED SETUP - OpenSSL Encryption

## Why This Recommendation?

**Use OpenSSL encryption** - it's the best balance of simplicity and security for your use case.

### Benefits:
- ✅ **Simple** - No cloud setup needed, works immediately
- ✅ **Secure** - Industry-standard AES-256 encryption
- ✅ **Only 6 GitHub Secrets** - Down from 14
- ✅ **Version controlled** - Secrets in git (encrypted)
- ✅ **Easy rotation** - Edit, encrypt, commit, push

## 🚀 5-Minute Setup

### Step 1: Generate Your Encryption Key

```bash
# This is your master key - save it securely!
openssl rand -base64 32
```

**Example output (yours will be different):**
```
K7mP9wQ2nL5vR8xT4cG6hB1dF3eY0zA=
```

💾 **Save this key somewhere safe** - you'll need it to decrypt and update secrets.

### Step 2: Create Your Secrets File

Create a file called `secrets.yaml` with your actual credentials:

```yaml
auth:
  secret: Wh3AHVpDqpAM2Ee7WXl3qx7xLBUvzeIf5EmbjhJfYng=
  google:
    # Use the AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET values you provided
    client_id: YOUR_GOOGLE_OAUTH_CLIENT_ID
    client_secret: YOUR_GOOGLE_OAUTH_CLIENT_SECRET

firebase:
  api_key: AIzaSyBLrP7aHXPxPgVywtRje2IA4vgW9YJABIs
  auth_domain: learning-english-477407.firebaseapp.com
  project_id: learning-english-477407
  storage_bucket: learning-english-477407.firebasestorage.app
  messaging_sender_id: "215741399231"
  app_id: 1:215741399231:web:8dd8a4d41adfb5c761860a
  measurement_id: G-4GQEGC94C2
```

**📝 Replace the placeholders above with your actual OAuth values from the environment variables you shared.**

### Step 3: Encrypt the File

```bash
# Replace YOUR_KEY with the key from Step 1
cat secrets.yaml | openssl enc -aes-256-cbc -salt -pbkdf2 -a \
  -pass pass:YOUR_KEY > secrets.enc

# Delete the plaintext file (important!)
rm secrets.yaml
```

### Step 4: Add GitHub Secrets

You only need **6 secrets** in GitHub:

```bash
# 1. Your encryption key
gh secret set OPENSSL_SECRET_KEY --body "YOUR_KEY_FROM_STEP_1"

# 2-6. Provider credentials
gh secret set GCP_PROJECT_ID --body "learning-english-477407"
gh secret set GCP_SERVICE_ACCOUNT_KEY --body "$(cat ~/gcp-key.json)"
gh secret set VERCEL_TOKEN --body "YOUR_VERCEL_TOKEN"
gh secret set VERCEL_ORG_ID --body "YOUR_VERCEL_ORG_ID"
gh secret set VERCEL_PROJECT_ID --body "YOUR_VERCEL_PROJECT_ID"
```

**Don't have these yet?**
- **GCP Service Account**: See [Infrastructure Setup Guide](./INFRASTRUCTURE_SETUP.md)
- **Vercel Token**: Go to https://vercel.com/account/tokens
- **Vercel IDs**: Run `vercel teams list` and `vercel projects list`

### Step 5: Commit and Deploy

```bash
# Commit the encrypted file (safe to commit!)
git add secrets.enc
git commit -m "Add encrypted secrets"

# Push to your current branch for testing
git push origin YOUR_BRANCH_NAME

# Or push to master for production deployment
# git push origin master

# GitHub Actions will automatically:
# 1. Decrypt secrets.enc
# 2. Use the values to build and deploy
# 3. Your app goes live! 🚀
```

**Testing in a branch first? Good idea!**
- Push to your feature branch (e.g., `git push origin copilot/setup-infrastructure-as-code`)
- GitHub Actions will run on your branch
- Review the workflow results
- Merge to master when ready

## 🔄 Updating Secrets Later

When you need to change a secret (rotate credentials, update config, etc.):

```bash
# 1. Decrypt
openssl enc -aes-256-cbc -d -a -pbkdf2 -in secrets.enc \
  -pass pass:YOUR_KEY > secrets.yaml

# 2. Edit the file
vim secrets.yaml
# or: nano secrets.yaml

# 3. Re-encrypt
cat secrets.yaml | openssl enc -aes-256-cbc -salt -pbkdf2 -a \
  -pass pass:YOUR_KEY > secrets.enc

# 4. Clean up and deploy
rm secrets.yaml
git add secrets.enc
git commit -m "Update secrets"
git push origin master
```

## 📊 What You Achieved

**Before:**
- 14 GitHub Secrets to manage
- Secrets in UI only (no version control)
- Hard to track changes
- Difficult to rotate

**After (OpenSSL):**
- 6 GitHub Secrets (57% reduction!)
- Secrets version controlled (encrypted)
- Easy to track changes in git
- Simple rotation: edit → encrypt → commit

## ⚠️ Security Best Practices

### Immediate (Do This Now):

Your credentials were shared in plain text. For production, you should:

1. **Generate a new AUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   # Use this in secrets.yaml instead
   ```

2. **Create new Google OAuth credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create new OAuth 2.0 Client ID
   - Delete the old one
   - Update secrets.yaml with new values

### Always:

- ✅ Keep your encryption key secure (password manager)
- ✅ Never commit `secrets.yaml` (plaintext) to git
- ✅ Only commit `secrets.enc` (encrypted)
- ✅ Rotate credentials regularly
- ✅ Use different keys for different environments

## 🆘 Troubleshooting

### Error: "bad decrypt"
- Wrong encryption key
- Solution: Use the exact key from Step 1

### Error: "command not found: openssl"
- OpenSSL not installed
- macOS/Linux: Pre-installed
- Windows: Use Git Bash or WSL

### GitHub Actions fails to decrypt
- Check `OPENSSL_SECRET_KEY` is set correctly
- Verify no extra spaces or newlines in the secret value

## ✅ You're Done!

That's it! Your infrastructure is now:
- ✅ Automated with Terraform
- ✅ Secrets encrypted and version controlled
- ✅ Only 6 GitHub Secrets needed
- ✅ Easy to maintain and rotate

**Next time you need to update anything:** Just decrypt, edit, encrypt, commit! 🎉

---

## 🔗 Related Documentation

- **Having issues?** See [QUICK_SECRETS_SETUP.md](./QUICK_SECRETS_SETUP.md) for detailed troubleshooting
- **Want to understand all options?** See [SECRETS_MANAGEMENT_SUMMARY.md](./SECRETS_MANAGEMENT_SUMMARY.md)
- **Need the full setup?** See [INFRASTRUCTURE_SETUP.md](./INFRASTRUCTURE_SETUP.md)
