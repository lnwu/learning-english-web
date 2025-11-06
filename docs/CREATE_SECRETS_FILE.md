# How to Create Your Encrypted Secrets File

## Quick Guide

This is the simplest way to create `secrets.enc` for your project.

## Step-by-Step

### 1. Create the Secrets File

Create a file called `secrets.yaml` in your project root:

```bash
cd /path/to/learning-english
touch secrets.yaml
```

Edit it with your values:

```yaml
auth:
  secret: Wh3AHVpDqpAM2Ee7WXl3qx7xLBUvzeIf5EmbjhJfYng=
  google:
    client_id: 215741399231-4nujfgo13s5m9cn09kmlotu1bbsl19pe.apps.googleusercontent.com
    client_secret: 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

firebase:
  api_key: AIzaSyBLrP7aHXPxPgVywtRje2IA4vgW9YJABIs
  auth_domain: learning-english-477407.firebaseapp.com
  project_id: learning-english-477407
  storage_bucket: learning-english-477407.firebasestorage.app
  messaging_sender_id: "215741399231"
  app_id: 1:215741399231:web:8dd8a4d41adfb5c761860a
  measurement_id: G-4GQEGC94C2
```

**These are your actual values from the environment variables you provided.**

### 2. Generate an Encryption Key

```bash
# Generate a random 32-byte key
openssl rand -base64 32
```

**Save this output!** You'll need it for decryption later.

Example output:
```
xK9mN2pQ5vL8rT4cG6hB1dF3eY0zA7wU=
```

### 3. Encrypt the File

```bash
# Replace YOUR_ENCRYPTION_KEY with the key from step 2
ENCRYPTION_KEY="YOUR_ENCRYPTION_KEY"

# Encrypt
cat secrets.yaml | openssl enc -aes-256-cbc -salt -pbkdf2 -a \
  -pass pass:$ENCRYPTION_KEY > secrets.enc

# Verify it was created
ls -lh secrets.enc
```

You should see `secrets.enc` created with encrypted content.

### 4. Delete the Plaintext File

```bash
# IMPORTANT: Delete the unencrypted version
rm secrets.yaml

# Verify it's gone
ls secrets.yaml  # Should show "No such file"
```

### 5. Add Encryption Key to GitHub

```bash
# Add your encryption key to GitHub Secrets
gh secret set OPENSSL_SECRET_KEY --body "$ENCRYPTION_KEY"

# Verify it was added
gh secret list | grep OPENSSL
```

### 6. Commit the Encrypted File

```bash
# Add the encrypted file
git add secrets.enc

# Commit
git commit -m "Add encrypted application secrets"

# Push to your current branch (NOT master yet)
git push origin $(git branch --show-current)
```

## ✅ Verification

Check that:
- [ ] `secrets.yaml` does NOT exist (deleted)
- [ ] `secrets.enc` exists and contains encrypted text
- [ ] `OPENSSL_SECRET_KEY` is set in GitHub Secrets
- [ ] File is committed to your branch

## 🧪 Test It

View the encrypted content (you should see gibberish):

```bash
cat secrets.enc
```

Expected output (encrypted):
```
U2FsdGVkX1/zDHSxAD1c2y57c9FHo83J/camZVGoHZqn/EMJfdyXVQjoLxGlJGGy
BIC5bxC+je+xKO5Z0yhZFoQmittCsGeZypWHEVqAfKPQ0QPpxOmyHoMB6krIe0qz
...
```

Test decryption (should show your original values):

```bash
openssl enc -aes-256-cbc -d -a -pbkdf2 -in secrets.enc \
  -pass pass:$ENCRYPTION_KEY
```

## 🚨 Important Security Notes

1. **Never commit `secrets.yaml`** (plaintext) to git
2. **Save your encryption key** securely (password manager)
3. **Add `secrets.yaml` to `.gitignore`** (already done)
4. **Only commit `secrets.enc`** (encrypted)

## 🔄 If You Need to Update Secrets Later

```bash
# 1. Decrypt
openssl enc -aes-256-cbc -d -a -pbkdf2 -in secrets.enc \
  -pass pass:$ENCRYPTION_KEY > secrets.yaml

# 2. Edit
vim secrets.yaml  # or nano, code, etc.

# 3. Re-encrypt
cat secrets.yaml | openssl enc -aes-256-cbc -salt -pbkdf2 -a \
  -pass pass:$ENCRYPTION_KEY > secrets.enc

# 4. Clean up and commit
rm secrets.yaml
git add secrets.enc
git commit -m "Update secrets"
git push origin $(git branch --show-current)
```

## 🆘 Troubleshooting

### Error: "openssl: command not found"

OpenSSL should be pre-installed on macOS and Linux. On Windows, use Git Bash or WSL.

### Error: "bad decrypt"

Wrong encryption key. Make sure you're using the exact key from step 2.

### Error: ".gitignore not working"

If you accidentally committed `secrets.yaml`:

```bash
# Remove from git
git rm --cached secrets.yaml
git commit -m "Remove plaintext secrets"
git push origin $(git branch --show-current)
```

## ✅ You're Done!

Your secrets are now:
- ✅ Encrypted with AES-256
- ✅ Safe to commit to git
- ✅ Ready for GitHub Actions to decrypt

Next: Push your branch and watch GitHub Actions deploy! 🚀
