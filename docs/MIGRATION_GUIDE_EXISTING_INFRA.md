# Migrating Existing Infrastructure to Terraform IaC

## Overview

You already have infrastructure set up manually in the web console (GCP, Firebase, Vercel). This guide shows you how to migrate to Infrastructure as Code (IaC) with Terraform.

## 🎯 What You'll Achieve

- ✅ **Import existing resources** into Terraform state
- ✅ **Version control** your infrastructure
- ✅ **Avoid recreating** resources (no downtime)
- ✅ **Manage changes** through code going forward

## 📋 Prerequisites

Before starting, gather information about your existing setup:

### 1. Google Cloud Platform
```bash
# List your existing resources
gcloud projects list
gcloud iam service-accounts list --project=YOUR_PROJECT_ID
gcloud kms keyrings list --location=global --project=YOUR_PROJECT_ID
gcloud secrets list --project=YOUR_PROJECT_ID
```

### 2. Firebase
- Project ID: `learning-english-477407` (you already have this)
- Make note of any custom configurations

### 3. Vercel
```bash
# List your projects
vercel projects list

# Get project details
vercel inspect YOUR_PROJECT_NAME
```

## 🔄 Migration Strategy: Two Approaches

### Option 1: Import Existing Resources (Recommended)

This approach imports your existing resources into Terraform without recreating them.

**Pros:**
- ✅ No downtime
- ✅ Keeps existing resources
- ✅ Safer migration

**Cons:**
- ⚠️ Requires manual import commands
- ⚠️ More initial setup

### Option 2: Fresh Start (Simple but Disruptive)

Create new infrastructure with Terraform and migrate data.

**Pros:**
- ✅ Clean slate
- ✅ Simpler process

**Cons:**
- ⚠️ Requires data migration
- ⚠️ Potential downtime
- ⚠️ New resource IDs

## 🎯 Recommended: Option 1 - Import Existing Resources

### Step 1: Initialize Terraform

```bash
cd terraform

# Initialize Terraform
terraform init

# Create a basic configuration for your existing resources
```

### Step 2: Configure Terraform to Match Your Existing Setup

Edit `terraform/terraform.tfvars`:

```hcl
# Your existing project
gcp_project_id = "learning-english-477407"
gcp_region     = "us-central1"

# Your existing Vercel setup
vercel_token       = "YOUR_VERCEL_TOKEN"
vercel_org_id      = "YOUR_EXISTING_ORG_ID"
vercel_project_id  = "YOUR_EXISTING_PROJECT_ID"
vercel_project_name = "learning-english"

github_repo = "lnwu/learning-english"
```

### Step 3: Import Existing Service Account (If Exists)

If you already created a service account manually:

```bash
# Find your existing service account
gcloud iam service-accounts list --project=learning-english-477407

# Import it into Terraform state
terraform import google_service_account.github_actions \
  projects/learning-english-477407/serviceAccounts/SERVICE_ACCOUNT_EMAIL
```

### Step 4: Skip KMS Resources (If Not Existing)

Since you probably don't have KMS resources yet, modify `terraform/main.tf` to comment out KMS resources temporarily:

```hcl
# Comment out these sections if you don't have KMS yet:
# resource "google_kms_key_ring" "sops" { ... }
# resource "google_kms_crypto_key" "sops" { ... }
```

Or just let Terraform create them (they're cheap and useful).

### Step 5: Import Vercel Project

```bash
# Get your Vercel project ID
vercel projects list

# Import the Vercel project into Terraform
# Note: Vercel resources are typically managed via API, not imported
# The Terraform Vercel provider will work with existing projects
```

### Step 6: Plan and Apply

```bash
# Review what Terraform will do
terraform plan

# Look for:
# - Resources to create (new ones)
# - Resources to import (existing ones)
# - Resources to modify (should be minimal)

# Apply the changes
terraform apply
```

## 🎬 Quick Start: Simplified Migration

If you want to start fresh with Terraform managing everything:

### Step 1: Document Current State

```bash
# Save current environment variables from Vercel
vercel env ls production > current-vercel-env.txt

# List current GCP resources
gcloud projects describe learning-english-477407 > current-gcp.txt
```

### Step 2: Create New Service Account

The Terraform configuration will create:
- New service account: `github-actions-deploy`
- KMS key ring and crypto key (for SOPS)
- Minimal Secret Manager resources

```bash
cd terraform
terraform init
terraform apply
```

### Step 3: Update GitHub Secrets

```bash
# Add the new service account key
terraform output github_actions_service_account_email

# Create and download key
gcloud iam service-accounts keys create ~/gcp-key-terraform.json \
  --iam-account=$(terraform output -raw github_actions_service_account_email)

# Update GitHub Secret
gh secret set GCP_SERVICE_ACCOUNT_KEY --body "$(cat ~/gcp-key-terraform.json)"
```

### Step 4: Keep Vercel Project As-Is

The Terraform Vercel module is configured to work with your existing project:
- It won't recreate your project
- It will manage environment variables going forward
- Your deployment history is preserved

## 🔐 Migrating Secrets

### Current State (Manual)
Your secrets are probably in:
1. Vercel dashboard (environment variables)
2. Local `.env.local` file
3. GitHub Secrets

### Target State (IaC)
Secrets will be:
1. **Encrypted in repository** (`secrets.enc`) - Application secrets
2. **GitHub Secrets** (6 total) - Provider credentials + encryption key
3. **Managed by Terraform** - Vercel env vars auto-updated

### Migration Steps

1. **Export current Vercel environment variables:**
   ```bash
   vercel env ls production
   # Copy these values
   ```

2. **Create `secrets.yaml`:**
   ```yaml
   auth:
     secret: [from Vercel AUTH_SECRET]
     google:
       client_id: [from Vercel AUTH_GOOGLE_ID]
       client_secret: [from Vercel AUTH_GOOGLE_SECRET]
   
   firebase:
     api_key: [from Vercel NEXT_PUBLIC_FIREBASE_API_KEY]
     # ... etc
   ```

3. **Encrypt with OpenSSL:**
   ```bash
   ENCRYPTION_KEY=$(openssl rand -base64 32)
   cat secrets.yaml | openssl enc -aes-256-cbc -salt -pbkdf2 -a \
     -pass pass:$ENCRYPTION_KEY > secrets.enc
   rm secrets.yaml
   ```

4. **Add encryption key to GitHub:**
   ```bash
   gh secret set OPENSSL_SECRET_KEY --body "$ENCRYPTION_KEY"
   ```

5. **Commit encrypted secrets:**
   ```bash
   git add secrets.enc
   git commit -m "Add encrypted secrets"
   git push origin YOUR_BRANCH
   ```

## 🧪 Testing Your Migration

### Test in Your Branch First

```bash
# You're already in: copilot/setup-infrastructure-as-code
# This is perfect for testing!

# 1. Create and encrypt secrets
# (follow steps above)

# 2. Push to your branch
git add secrets.enc
git commit -m "Add encrypted secrets for testing"
git push origin copilot/setup-infrastructure-as-code

# 3. Watch GitHub Actions
# Go to: https://github.com/lnwu/learning-english/actions
# Check the workflow run for your branch

# 4. Review the deployment
# Vercel will create a preview deployment
# Test it thoroughly

# 5. Merge to master when ready
```

### Validation Checklist

- [ ] Terraform plan shows no destructive changes
- [ ] GitHub Actions workflow completes successfully
- [ ] Secrets decrypt correctly in workflow
- [ ] Vercel deployment succeeds
- [ ] Application works correctly (OAuth, Firebase)
- [ ] No existing resources were destroyed

## 🚨 Rollback Plan

If something goes wrong:

### Rollback Terraform Changes

```bash
# Destroy Terraform-managed resources (if needed)
cd terraform
terraform destroy

# Or revert specific resources
terraform state rm RESOURCE_NAME
```

### Rollback Secrets

```bash
# Re-add secrets to GitHub Secrets manually
gh secret set AUTH_SECRET --body "..."
gh secret set AUTH_GOOGLE_ID --body "..."
# etc.

# Update Vercel environment variables manually
vercel env add AUTH_SECRET production
```

### Rollback Code

```bash
# Revert to previous commit
git revert HEAD
git push origin YOUR_BRANCH
```

## 📊 Migration Comparison

| Aspect | Before (Manual) | After (IaC) |
|--------|----------------|-------------|
| **Infrastructure Changes** | Web console clicks | Code commits |
| **Secret Management** | 14 GitHub Secrets | 6 GitHub Secrets + encrypted file |
| **Version Control** | None | Full git history |
| **Team Collaboration** | Share credentials | Share code |
| **Deployment** | Manual Vercel CLI | Automated on merge |
| **Rollback** | Manual restore | Git revert |
| **Audit Trail** | None | Git commits |

## 🎯 Recommended Migration Path for You

Based on your setup:

1. **Keep existing infrastructure** (no need to recreate)
2. **Let Terraform create new resources** (KMS, service account)
3. **Migrate secrets** to encrypted file (OpenSSL method)
4. **Test in your branch** (`copilot/setup-infrastructure-as-code`)
5. **Merge to master** when confident

### Specific Steps for Your Setup

```bash
# 1. You're already in the right branch
git branch
# Should show: copilot/setup-infrastructure-as-code

# 2. Run Terraform to create NEW resources (not replace existing)
cd terraform
terraform init
terraform apply  # Creates KMS, new service account, etc.

# 3. Create encrypted secrets file
cd ..
# Create secrets.yaml with your values
ENCRYPTION_KEY=$(openssl rand -base64 32)
cat secrets.yaml | openssl enc -aes-256-cbc -salt -pbkdf2 -a \
  -pass pass:$ENCRYPTION_KEY > secrets.enc
rm secrets.yaml

# 4. Add minimal GitHub Secrets
gh secret set OPENSSL_SECRET_KEY --body "$ENCRYPTION_KEY"
# (you may already have the other 5 provider secrets)

# 5. Test in this branch
git add secrets.enc
git commit -m "Add encrypted secrets"
git push origin copilot/setup-infrastructure-as-code

# 6. Check GitHub Actions
# Watch the workflow run: https://github.com/lnwu/learning-english/actions

# 7. Test the preview deployment
# Vercel creates a preview URL for your branch

# 8. Merge when ready
# Create PR and merge to master
```

## 🆘 Common Issues

### Issue: Terraform wants to recreate resources

**Solution**: Import existing resources first, or modify Terraform config to match existing state.

### Issue: Secrets not decrypting

**Solution**: Verify `OPENSSL_SECRET_KEY` is set correctly in GitHub Secrets.

### Issue: Vercel deployment fails

**Solution**: Check Vercel token has correct permissions, verify project ID is correct.

### Issue: GitHub Actions fails

**Solution**: Review workflow logs, ensure all 6 GitHub Secrets are set.

## 📚 Related Documentation

- [Recommended Setup](./RECOMMENDED_SETUP.md) - Quick setup guide
- [Infrastructure Setup](./INFRASTRUCTURE_SETUP.md) - Full Terraform guide
- [Secrets Management](./SECRETS_MANAGEMENT_SUMMARY.md) - All options

## ✅ Summary

You're in a great position:
- ✅ Testing in a branch (smart!)
- ✅ Existing infrastructure works (no rush)
- ✅ Can migrate incrementally
- ✅ Easy rollback if needed

**Next steps:**
1. Follow the "Specific Steps for Your Setup" above
2. Test thoroughly in your branch
3. Merge to master when confident

Good luck with your migration! 🚀
