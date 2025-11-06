# Quick Setup: Encrypt Your Secrets

## ⚠️ IMPORTANT SECURITY NOTE

Your credentials have been shared in this conversation. For security, you should:

1. **Rotate these credentials immediately after setup:**
   - Generate new `AUTH_SECRET`: `openssl rand -base64 32`
   - Create new Google OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Regenerate Firebase config (optional, but recommended)

2. **Never share credentials in plain text again**

## 🚀 Simple Encryption Setup (5 minutes)

I'll give you the simplest approach that works immediately:

### Option 1: OpenSSL Encryption (Simplest - No Setup Required)

#### Step 1: Create your secrets file

Create `secrets.yaml`:
```yaml
auth:
  secret: Wh3AHVpDqpAM2Ee7WXl3qx7xLBUvzeIf5EmbjhJfYng=
  google:
    # Replace with your actual values from the environment variables you provided
    client_id: YOUR_GOOGLE_OAUTH_CLIENT_ID_HERE
    client_secret: YOUR_GOOGLE_OAUTH_CLIENT_SECRET_HERE

firebase:
  api_key: AIzaSyBLrP7aHXPxPgVywtRje2IA4vgW9YJABIs
  auth_domain: learning-english-477407.firebaseapp.com
  project_id: learning-english-477407
  storage_bucket: learning-english-477407.firebasestorage.app
  messaging_sender_id: "215741399231"
  app_id: 1:215741399231:web:8dd8a4d41adfb5c761860a
  measurement_id: G-4GQEGC94C2
```

#### Step 2: Generate an encryption key

```bash
# Generate a random encryption key
openssl rand -base64 32

# Example output (USE YOUR OWN!):
# K7mP9wQ2nL5vR8xT4cG6hB1dF3eY0zA=
```

#### Step 3: Encrypt the file

```bash
# Encrypt secrets.yaml
cat secrets.yaml | openssl enc -aes-256-cbc -salt -pbkdf2 -a -pass pass:YOUR_ENCRYPTION_KEY_HERE > secrets.enc

# Delete the plaintext file
rm secrets.yaml
```

#### Step 4: Add encryption key to GitHub Secrets

```bash
# Add your encryption key to GitHub Secrets
gh secret set OPENSSL_SECRET_KEY --body "YOUR_ENCRYPTION_KEY_HERE"
```

#### Step 5: Commit encrypted file

```bash
git add secrets.enc
git commit -m "Add encrypted secrets"
git push origin master
```

### Option 2: Use the values directly in GitHub Secrets (Simpler but more secrets)

If you prefer the original approach with all secrets in GitHub:

```bash
# Just add them directly to GitHub Secrets
gh secret set AUTH_SECRET --body "Wh3AHVpDqpAM2Ee7WXl3qx7xLBUvzeIf5EmbjhJfYng="
gh secret set AUTH_GOOGLE_ID --body "[REDACTED]"
gh secret set AUTH_GOOGLE_SECRET --body "[REDACTED]"
gh secret set FIREBASE_API_KEY --body "AIzaSyBLrP7aHXPxPgVywtRje2IA4vgW9YJABIs"
gh secret set FIREBASE_AUTH_DOMAIN --body "learning-english-477407.firebaseapp.com"
gh secret set FIREBASE_PROJECT_ID --body "learning-english-477407"
gh secret set FIREBASE_STORAGE_BUCKET --body "learning-english-477407.firebasestorage.app"
gh secret set FIREBASE_MESSAGING_SENDER_ID --body "215741399231"
gh secret set FIREBASE_APP_ID --body "1:215741399231:web:8dd8a4d41adfb5c761860a"
gh secret set FIREBASE_MEASUREMENT_ID --body "G-4GQEGC94C2"

# Plus provider credentials
gh secret set GCP_PROJECT_ID --body "learning-english-477407"
gh secret set VERCEL_TOKEN --body "YOUR_VERCEL_TOKEN"
gh secret set VERCEL_ORG_ID --body "YOUR_VERCEL_ORG_ID"
gh secret set VERCEL_PROJECT_ID --body "YOUR_VERCEL_PROJECT_ID"
```

## 📋 Which Option Should You Choose?

| Option | GitHub Secrets Count | Complexity | Best For |
|--------|---------------------|------------|----------|
| **Option 1: OpenSSL** | 6 (5 provider + 1 encryption key) | Low | Version-controlled secrets |
| **Option 2: All in GitHub** | 14 | Very Low | Quick start, less setup |

## 🔒 Recommended: Option 1 with Credential Rotation

Here's what I recommend:

### 1. Set up OpenSSL encryption (as shown above)

### 2. Rotate sensitive credentials

**Generate new AUTH_SECRET:**
```bash
openssl rand -base64 32
# Use this new value in secrets.yaml
```

**Create new Google OAuth credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Click "CREATE CREDENTIALS" → "OAuth client ID"
3. Application type: Web application
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-vercel-domain.vercel.app/api/auth/callback/google`
5. Copy new Client ID and Client Secret
6. Update secrets.yaml with new values

### 3. Delete old OAuth credentials
- In Google Cloud Console, delete the old OAuth client ID

### 4. Encrypt and commit
```bash
# Encrypt with your key
cat secrets.yaml | openssl enc -aes-256-cbc -salt -pbkdf2 -a -pass pass:YOUR_KEY > secrets.enc
rm secrets.yaml

# Commit
git add secrets.enc
git commit -m "security: Add encrypted secrets with rotated credentials"
git push origin master
```

## 📝 Decryption in GitHub Actions

The workflow needs to be updated to decrypt using OpenSSL. Here's the updated decrypt step:

```yaml
- name: Decrypt secrets
  run: |
    # Decrypt secrets.enc using OpenSSL
    if [ -f secrets.enc ]; then
      openssl enc -aes-256-cbc -d -a -pbkdf2 -in secrets.enc -pass pass:${{ secrets.OPENSSL_SECRET_KEY }} > secrets.yaml
      
      # Export as environment variables
      export AUTH_SECRET=$(yq eval '.auth.secret' secrets.yaml)
      export AUTH_GOOGLE_ID=$(yq eval '.auth.google.client_id' secrets.yaml)
      # ... etc
      
      # Clean up
      rm secrets.yaml
    fi
```

## 🔄 Updating Secrets Later

```bash
# 1. Decrypt
openssl enc -aes-256-cbc -d -a -pbkdf2 -in secrets.enc -pass pass:YOUR_KEY > secrets.yaml

# 2. Edit
vim secrets.yaml

# 3. Re-encrypt
cat secrets.yaml | openssl enc -aes-256-cbc -salt -pbkdf2 -a -pass pass:YOUR_KEY > secrets.enc

# 4. Clean up and commit
rm secrets.yaml
git add secrets.enc
git commit -m "update: Rotate secrets"
git push origin master
```

## ✅ Summary

For your case, I recommend:

1. **Immediate action:**
   - Use Option 2 (all in GitHub Secrets) to get running quickly
   - This gets your app deployed fast

2. **Follow-up (within a day):**
   - Rotate to new credentials (especially OAuth)
   - Switch to Option 1 (OpenSSL encryption)
   - Remove old secrets from GitHub

3. **Long-term:**
   - Keep encrypted secrets in git
   - Only 6 secrets in GitHub
   - Easy to rotate and track changes

## 🆘 Quick Commands Reference

```bash
# Generate encryption key
openssl rand -base64 32

# Encrypt
cat secrets.yaml | openssl enc -aes-256-cbc -salt -pbkdf2 -a -pass pass:KEY > secrets.enc

# Decrypt
openssl enc -aes-256-cbc -d -a -pbkdf2 -in secrets.enc -pass pass:KEY > secrets.yaml

# Add to GitHub Secrets
gh secret set OPENSSL_SECRET_KEY --body "YOUR_KEY"
```

---

**Need help?** Let me know if you want me to:
1. Update the GitHub Actions workflow for OpenSSL decryption
2. Create a script to automate the encryption process
3. Help with credential rotation
