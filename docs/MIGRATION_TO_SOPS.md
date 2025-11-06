# Migration Guide: GitHub Secrets → SOPS Encryption

Quick guide for migrating from 15 GitHub Secrets to 5 GitHub Secrets + SOPS encrypted secrets.

## 🎯 What's Changing

**Before:**
- 15 GitHub Secrets (all credentials)
- Secrets managed via GitHub UI
- No version control for secrets

**After:**
- 5 GitHub Secrets (only provider credentials)
- Application secrets encrypted in repository with SOPS
- Version controlled, easy to rotate

## 📋 Migration Steps

### Step 1: Update Infrastructure (5 minutes)

```bash
cd terraform

# Pull latest changes
git pull origin master

# Apply Terraform to create KMS resources
terraform init
terraform apply

# This creates:
# - KMS Key Ring: sops
# - KMS Crypto Key: sops-key
# - Updates service account permissions
```

### Step 2: Configure SOPS (2 minutes)

```bash
# Navigate to project root
cd ..

# Update .sops.yaml with your project ID
export GCP_PROJECT_ID="your-project-id"
sed -i "s/PLACEHOLDER_PROJECT_ID/$GCP_PROJECT_ID/g" .sops.yaml

# Verify
cat .sops.yaml
```

### Step 3: Create Encrypted Secrets File (10 minutes)

```bash
# Install SOPS if not already installed
# macOS: brew install sops
# Linux: see docs/SOPS_SECRETS_MANAGEMENT.md

# Copy template
cp secrets.yaml.example secrets.yaml

# Get your current secret values from GitHub Secrets
# You can view them in Settings → Secrets → Actions (they're hidden but you set them)

# Edit secrets.yaml with your actual values
vim secrets.yaml
```

**secrets.yaml content:**
```yaml
auth:
  secret: YOUR_AUTH_SECRET_VALUE
  google:
    client_id: YOUR_AUTH_GOOGLE_ID
    client_secret: YOUR_AUTH_GOOGLE_SECRET

firebase:
  api_key: YOUR_FIREBASE_API_KEY
  auth_domain: YOUR_FIREBASE_AUTH_DOMAIN
  project_id: YOUR_FIREBASE_PROJECT_ID
  storage_bucket: YOUR_FIREBASE_STORAGE_BUCKET
  messaging_sender_id: YOUR_FIREBASE_MESSAGING_SENDER_ID
  app_id: YOUR_FIREBASE_APP_ID
  measurement_id: YOUR_FIREBASE_MEASUREMENT_ID
```

```bash
# Authenticate with Google Cloud (needed for KMS encryption)
gcloud auth application-default login

# Encrypt the secrets
sops --encrypt secrets.yaml > secrets.enc.yaml

# Verify encryption worked
cat secrets.enc.yaml
# Should show encrypted content, not plaintext

# Delete plaintext version (important!)
rm secrets.yaml
```

### Step 4: Update GitHub Secrets (5 minutes)

**Remove these 10 secrets** (they're now in secrets.enc.yaml):
```bash
gh secret remove AUTH_SECRET
gh secret remove AUTH_GOOGLE_ID
gh secret remove AUTH_GOOGLE_SECRET
gh secret remove FIREBASE_PROJECT_ID
gh secret remove FIREBASE_API_KEY
gh secret remove FIREBASE_AUTH_DOMAIN
gh secret remove FIREBASE_STORAGE_BUCKET
gh secret remove FIREBASE_MESSAGING_SENDER_ID
gh secret remove FIREBASE_APP_ID
gh secret remove FIREBASE_MEASUREMENT_ID
```

**Keep these 5 secrets** (provider credentials):
- `GCP_PROJECT_ID` ✅
- `GCP_SERVICE_ACCOUNT_KEY` ✅
- `VERCEL_TOKEN` ✅
- `VERCEL_ORG_ID` ✅
- `VERCEL_PROJECT_ID` ✅

Verify:
```bash
gh secret list

# Should show only 5 secrets
```

### Step 5: Commit and Deploy (3 minutes)

```bash
# Add encrypted secrets to git
git add secrets.enc.yaml .sops.yaml

# Commit
git commit -m "migrate: Switch to SOPS encrypted secrets"

# Push to master (triggers deployment)
git push origin master
```

### Step 6: Verify Deployment (5 minutes)

```bash
# Monitor GitHub Actions
# Go to: https://github.com/YOUR_USERNAME/learning-english/actions

# Watch for:
# ✓ SOPS decrypts secrets.enc.yaml
# ✓ Vercel environment variables updated
# ✓ Application deployed successfully

# Test the deployed application
# Visit your Vercel URL and verify:
# ✓ Google OAuth login works
# ✓ Firebase features work
# ✓ Application functions normally
```

## ✅ Migration Complete!

You now have:
- ✅ 5 GitHub Secrets (vs 15 before)
- ✅ Encrypted secrets in git (version controlled)
- ✅ Easy secret rotation workflow
- ✅ Team collaboration via KMS permissions

## 🔄 Day-to-Day Usage

### Viewing Secrets

```bash
# Decrypt and view (doesn't save to disk)
sops secrets.enc.yaml
```

### Updating Secrets

```bash
# Edit encrypted file (automatically decrypts/encrypts)
sops secrets.enc.yaml

# Make your changes, save and exit
# File is automatically re-encrypted

# Commit and push
git add secrets.enc.yaml
git commit -m "rotate: Update AUTH_SECRET"
git push origin master

# Deployment automatically picks up the new secrets
```

### Adding New Secrets

```bash
# Edit encrypted file
sops secrets.enc.yaml

# Add new secret under appropriate section
# auth:
#   new_secret: value

# Save, commit, push
```

## 🛠️ Troubleshooting

### Error: "Failed to get the data key"

**Problem:** No KMS decrypt permission

**Solution:**
```bash
# Ensure you're authenticated
gcloud auth application-default login

# Verify you have permission
gcloud kms keys get-iam-policy sops-key \
  --location=global \
  --keyring=sops \
  --project=YOUR_PROJECT_ID
```

### GitHub Actions Fails to Decrypt

**Problem:** Service account missing KMS permission

**Solution:**
```bash
# Re-run Terraform to fix permissions
cd terraform
terraform apply
```

### Secrets Not Updating in Vercel

**Problem:** Deployment succeeded but secrets unchanged

**Solution:**
```bash
# Manually trigger re-deployment
git commit --allow-empty -m "chore: Trigger deployment"
git push origin master
```

## 📊 Comparison

| Aspect | Before (GitHub Secrets) | After (SOPS) |
|--------|------------------------|--------------|
| **Secrets Count** | 15 in GitHub | 5 in GitHub, 10 in git (encrypted) |
| **Version Control** | ❌ No | ✅ Yes |
| **Easy Rotation** | ❌ Manual UI updates | ✅ Edit, commit, push |
| **Team Access** | ❌ GitHub admin only | ✅ Via KMS IAM permissions |
| **Audit Trail** | ❌ No | ✅ Git history |
| **Multiple Envs** | ❌ Difficult | ✅ Separate encrypted files |
| **Secret Visibility** | ❌ Hidden | ✅ Encrypted but visible structure |

## 🎓 Learn More

- **[SOPS Management Guide](./SOPS_SECRETS_MANAGEMENT.md)** - Complete guide
- **[Infrastructure Setup](./INFRASTRUCTURE_SETUP.md)** - Full setup
- **[Terraform Quick Start](./TERRAFORM_QUICKSTART.md)** - Quick reference

## 🆘 Rollback (If Needed)

If you need to rollback to the old approach:

```bash
# 1. Re-add secrets to GitHub
gh secret set AUTH_SECRET --body "value"
gh secret set AUTH_GOOGLE_ID --body "value"
# ... etc

# 2. Revert the workflow changes
git revert HEAD

# 3. Push
git push origin master
```

## 🎉 Success!

You've successfully migrated to SOPS-based secret management. Enjoy the benefits of:
- Fewer GitHub Secrets to manage
- Version controlled secrets
- Easy rotation and team collaboration
- Better security posture

**Happy coding!** 🚀
