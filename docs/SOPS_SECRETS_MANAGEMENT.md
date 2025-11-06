# SOPS Secret Management Guide

## Overview

This project uses **SOPS** (Secrets OPerationS) with Google Cloud KMS for encrypting application secrets. This approach allows you to store secrets encrypted in your git repository while only requiring minimal provider credentials in GitHub Secrets.

## 🎯 Benefits

✅ **Only 3 GitHub Secrets needed** (vs 15 previously):
- `GCP_SERVICE_ACCOUNT_KEY`
- `GCP_PROJECT_ID`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

✅ **Secrets are version controlled** (encrypted)  
✅ **Easy to rotate and update**  
✅ **Team members can view/edit** with proper KMS permissions  
✅ **Better for multiple environments** (dev/staging/production)  
✅ **Audit trail** in git history  

## 🔐 How It Works

```
secrets.yaml (plaintext)
    ↓
SOPS + Google Cloud KMS
    ↓
secrets.enc.yaml (encrypted) ← Committed to git
    ↓
GitHub Actions decrypts with service account
    ↓
Environment variables for deployment
```

## 🚀 Quick Start

### 1. Install SOPS

```bash
# macOS
brew install sops

# Linux
wget https://github.com/mozilla/sops/releases/download/v3.8.1/sops-v3.8.1.linux.amd64
chmod +x sops-v3.8.1.linux.amd64
sudo mv sops-v3.8.1.linux.amd64 /usr/local/bin/sops

# Verify installation
sops --version
```

### 2. Set Up Google Cloud KMS

The Terraform configuration automatically creates the KMS key ring and crypto key. If you haven't run Terraform yet:

```bash
cd terraform
terraform init
terraform apply
```

This creates:
- KMS Key Ring: `sops`
- KMS Crypto Key: `sops-key`
- Location: `global`

### 3. Update SOPS Configuration

Edit `.sops.yaml` and replace `PLACEHOLDER_PROJECT_ID` with your actual GCP project ID:

```yaml
creation_rules:
  - gcp_kms: projects/YOUR_PROJECT_ID/locations/global/keyRings/sops/cryptoKeys/sops-key
    encrypted_regex: '^(auth|firebase|secrets)$'
```

### 4. Create Your Secrets File

```bash
# Copy the example file
cp secrets.yaml.example secrets.yaml

# Edit with your actual values
vim secrets.yaml
```

**secrets.yaml:**
```yaml
auth:
  secret: your-generated-secret-from-openssl
  google:
    client_id: your-google-oauth-client-id
    client_secret: your-google-oauth-client-secret

firebase:
  api_key: your-firebase-api-key
  auth_domain: your-project.firebaseapp.com
  project_id: your-firebase-project-id
  storage_bucket: your-project.firebasestorage.app
  messaging_sender_id: your-messaging-sender-id
  app_id: your-firebase-app-id
  measurement_id: your-measurement-id
```

### 5. Encrypt the Secrets

```bash
# Authenticate with Google Cloud
gcloud auth application-default login

# Encrypt the file
sops --encrypt secrets.yaml > secrets.enc.yaml

# Verify it's encrypted
cat secrets.enc.yaml
# You should see encrypted content with metadata

# Delete the plaintext version
rm secrets.yaml
```

### 6. Commit Encrypted Secrets

```bash
git add secrets.enc.yaml .sops.yaml
git commit -m "Add encrypted secrets"
git push origin master
```

## 📝 Managing Secrets

### View Encrypted Secrets

```bash
# Decrypt and view (doesn't save to disk)
sops secrets.enc.yaml
```

### Edit Encrypted Secrets

```bash
# Opens in your default editor, automatically decrypts
sops secrets.enc.yaml

# Make your changes, save and exit
# SOPS will automatically re-encrypt the file
```

### Update a Single Secret

```bash
# Edit the file
sops secrets.enc.yaml

# Or use sops set (for automated updates)
sops --set '["auth"]["secret"] "new-secret-value"' secrets.enc.yaml
```

### Rotate Secrets

```bash
# 1. Edit the encrypted file
sops secrets.enc.yaml

# 2. Update the value(s)
# 3. Save and exit

# 4. Commit the changes
git add secrets.enc.yaml
git commit -m "rotate: Update AUTH_SECRET"
git push origin master

# 5. Deployment pipeline will automatically pick up changes
```

## 🔍 Decryption in CI/CD

The GitHub Actions workflow automatically decrypts secrets during deployment:

```yaml
- name: Install SOPS
  run: |
    wget https://github.com/mozilla/sops/releases/download/v3.8.1/sops-v3.8.1.linux.amd64
    chmod +x sops-v3.8.1.linux.amd64
    sudo mv sops-v3.8.1.linux.amd64 /usr/local/bin/sops

- name: Decrypt secrets
  run: |
    sops --decrypt secrets.enc.yaml > secrets.yaml
    # Extract and export as environment variables
```

## 🔐 Permissions

### Who Can Decrypt?

Only those with `roles/cloudkms.cryptoKeyDecrypter` permission on the KMS key can decrypt secrets.

By default:
- ✅ GitHub Actions service account (configured by Terraform)
- ✅ Users with `gcloud auth application-default login`
- ❌ Other users (unless granted permission)

### Grant Access to Team Members

```bash
# Grant decrypt permission to a user
gcloud kms keys add-iam-policy-binding sops-key \
  --location=global \
  --keyring=sops \
  --member="user:teammate@example.com" \
  --role="roles/cloudkms.cryptoKeyDecrypter"

# Grant encrypt permission (for editing)
gcloud kms keys add-iam-policy-binding sops-key \
  --location=global \
  --keyring=sops \
  --member="user:teammate@example.com" \
  --role="roles/cloudkms.cryptoKeyEncrypter"
```

### Revoke Access

```bash
gcloud kms keys remove-iam-policy-binding sops-key \
  --location=global \
  --keyring=sops \
  --member="user:ex-teammate@example.com" \
  --role="roles/cloudkms.cryptoKeyDecrypter"
```

## 🌍 Multiple Environments

You can maintain separate encrypted secrets for different environments:

```bash
# Development
sops --encrypt secrets.dev.yaml > secrets.dev.enc.yaml

# Staging
sops --encrypt secrets.staging.yaml > secrets.staging.enc.yaml

# Production
sops --encrypt secrets.yaml > secrets.enc.yaml
```

Update your CI/CD workflow to use the appropriate file based on the branch or environment.

## 🛠️ Troubleshooting

### Error: "Failed to get the data key"

**Issue**: No permission to decrypt with KMS

**Solution**:
```bash
# Ensure you're authenticated
gcloud auth application-default login

# Verify you have decrypt permission
gcloud kms keys get-iam-policy sops-key \
  --location=global \
  --keyring=sops
```

### Error: "The file is not encrypted"

**Issue**: Trying to decrypt a plaintext file

**Solution**:
```bash
# Encrypt it first
sops --encrypt secrets.yaml > secrets.enc.yaml
```

### Error: "No SOPS config found"

**Issue**: Missing or incorrect .sops.yaml

**Solution**:
```bash
# Ensure .sops.yaml exists and has correct project ID
cat .sops.yaml

# Should show:
# creation_rules:
#   - gcp_kms: projects/YOUR_PROJECT_ID/locations/global/keyRings/sops/cryptoKeys/sops-key
```

### Accidentally Committed Plaintext Secrets

**Solution**:
```bash
# Remove from git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch secrets.yaml" \
  --prune-empty --tag-name-filter cat -- --all

# Force push
git push origin --force --all

# Rotate all the exposed secrets immediately!
```

## 📊 Comparison: Before vs After

### Before (15 GitHub Secrets):
```
❌ GCP_PROJECT_ID
❌ GCP_SERVICE_ACCOUNT_KEY
❌ VERCEL_TOKEN
❌ VERCEL_ORG_ID
❌ VERCEL_PROJECT_ID
❌ AUTH_SECRET
❌ AUTH_GOOGLE_ID
❌ AUTH_GOOGLE_SECRET
❌ FIREBASE_PROJECT_ID
❌ FIREBASE_API_KEY
❌ FIREBASE_AUTH_DOMAIN
❌ FIREBASE_STORAGE_BUCKET
❌ FIREBASE_MESSAGING_SENDER_ID
❌ FIREBASE_APP_ID
❌ FIREBASE_MEASUREMENT_ID
```

### After (5 GitHub Secrets):
```
✅ GCP_PROJECT_ID
✅ GCP_SERVICE_ACCOUNT_KEY
✅ VERCEL_TOKEN
✅ VERCEL_ORG_ID
✅ VERCEL_PROJECT_ID

📦 secrets.enc.yaml (in git):
   - AUTH_SECRET
   - AUTH_GOOGLE_ID
   - AUTH_GOOGLE_SECRET
   - FIREBASE_* (7 values)
```

## 🎯 Best Practices

1. **Never commit plaintext secrets**
   - Always encrypt with SOPS before committing
   - Add `secrets.yaml` to `.gitignore`

2. **Rotate secrets regularly**
   - Easy with SOPS - just edit and commit
   - Git history tracks all changes

3. **Use different keys for different environments**
   - Separate KMS keys for dev/staging/production
   - Limits blast radius if key is compromised

4. **Audit access**
   ```bash
   # Check who has access to the KMS key
   gcloud kms keys get-iam-policy sops-key \
     --location=global \
     --keyring=sops
   ```

5. **Enable KMS audit logging**
   - Track all encrypt/decrypt operations
   - Helpful for compliance and security

## 📚 Additional Resources

- [SOPS Documentation](https://github.com/mozilla/sops)
- [Google Cloud KMS](https://cloud.google.com/kms/docs)
- [SOPS with GCP KMS Guide](https://github.com/mozilla/sops#encrypting-using-gcp-kms)

## 🆘 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your GCP permissions
3. Ensure `.sops.yaml` is configured correctly
4. Check Terraform applied successfully (created KMS key)

---

## Summary

SOPS provides a secure, auditable way to manage secrets in code while minimizing the number of secrets stored in GitHub. Combined with Google Cloud KMS, it gives you enterprise-grade secret management with minimal operational overhead.

**Benefits:**
- ✅ Fewer secrets to manage in GitHub
- ✅ Version controlled secrets (encrypted)
- ✅ Easy rotation and updates
- ✅ Team collaboration with proper access control
- ✅ Git history for audit trail
