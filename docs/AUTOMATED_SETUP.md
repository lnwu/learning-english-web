# Zero-Manual Automated Setup

## Overview

**Downtime is acceptable. No manual steps. Fully automated.**

This is the simplest possible setup - one script that does everything automatically.

## What You Need

Before running the script, gather these credentials:

### 1. Google Cloud Platform
- **Project ID**: `learning-english-477407`
- **Service Account Key**: Download JSON from [GCP Console](https://console.cloud.google.com/iam-admin/serviceaccounts)
  - Go to IAM & Admin → Service Accounts
  - Create or select existing service account
  - Keys → Add Key → Create new key → JSON
  - Download the file

### 2. Vercel
- **API Token**: Get from [Vercel Tokens](https://vercel.com/account/tokens)
- **Organization ID**: Run `vercel teams ls`
- **Project ID**: Run `vercel project ls`

### 3. Application Secrets (You Already Have These)
- AUTH_SECRET: `Wh3AHVpDqpAM2Ee7WXl3qx7xLBUvzeIf5EmbjhJfYng=`
- AUTH_GOOGLE_ID: `215741399231-4nujfgo13s5m9cn09kmlotu1bbsl19pe.apps.googleusercontent.com`
- AUTH_GOOGLE_SECRET: `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`
- All Firebase values (you provided these)

## Installation

Install prerequisites (one-time):

```bash
# Install GitHub CLI (if not installed)
# Mac:
brew install gh

# Linux:
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Authenticate
gh auth login
```

## Run Automated Setup

**One command. That's it.**

```bash
./scripts/automated-setup.sh
```

The script will:
1. ✅ Ask for your credentials (with defaults from your provided values)
2. ✅ Create encrypted secrets file (`secrets.enc`)
3. ✅ Set up 6 GitHub Secrets automatically
4. ✅ Commit and push changes
5. ✅ Trigger automatic deployment
6. ✅ Done!

### What It Does Automatically

```
┌─────────────────────────────────────┐
│  1. Gather Credentials              │
│     (with sensible defaults)        │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  2. Create secrets.yaml             │
│     (with your app secrets)         │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  3. Generate Encryption Key         │
│     (random 32-byte key)            │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  4. Encrypt → secrets.enc           │
│     (AES-256-CBC encryption)        │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  5. Delete Plaintext                │
│     (rm secrets.yaml)               │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  6. Set GitHub Secrets (6)          │
│     • GCP_PROJECT_ID                │
│     • GCP_SERVICE_ACCOUNT_KEY       │
│     • VERCEL_TOKEN                  │
│     • VERCEL_ORG_ID                 │
│     • VERCEL_PROJECT_ID             │
│     • OPENSSL_SECRET_KEY            │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  7. Commit secrets.enc              │
│     (encrypted, safe to commit)     │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  8. Push to Current Branch          │
│     (triggers GitHub Actions)       │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  9. Automated Deployment            │
│     GitHub Actions → Vercel         │
└─────────────────────────────────────┘
```

## Example Run

```bash
$ ./scripts/automated-setup.sh

==================================================
  Automated Infrastructure Setup
  Learning English - OpenSSL Encryption Method
==================================================

This script will:
  1. Create encrypted secrets file from your credentials
  2. Set up minimal GitHub Secrets (6 total)
  3. Configure Terraform
  4. Initialize and apply infrastructure
  5. Deploy everything automatically

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Checking Prerequisites
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ All prerequisites satisfied

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Step 1: Gathering Credentials
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Enter your credentials (these will be encrypted):

GCP Project ID [learning-english-477407]: ⏎
Path to GCP service account JSON key file: ~/gcp-key.json

ℹ For Vercel credentials:
  - Token: https://vercel.com/account/tokens
  - IDs: Run 'vercel project ls' and 'vercel teams ls'

Vercel API Token: abc123...
Vercel Organization ID: team_xyz...
Vercel Project ID: prj_abc...

ℹ Application secrets (from your credentials):

AUTH_SECRET [Wh3AHVpDqpAM2Ee7WXl3qx7xLBUvzeIf5EmbjhJfYng=]: ⏎
AUTH_GOOGLE_ID [215741399231-4nujfgo13s5m9cn09kmlotu1bbsl19pe.apps.googleusercontent.com]: ⏎
AUTH_GOOGLE_SECRET [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]: ⏎

# ... (continues with defaults)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Step 2: Creating Encrypted Secrets File
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ Creating secrets.yaml with your credentials...
✓ secrets.yaml created
ℹ Generating encryption key...
✓ Encryption key generated
ℹ Encrypting secrets with AES-256-CBC...
✓ secrets.enc created
✓ Encryption verified - secrets.enc exists
ℹ Removing plaintext secrets.yaml...
✓ Plaintext secrets removed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Step 3: Configuring GitHub Secrets (6 total)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ Setting minimal GitHub Secrets...
✓ 1/6 GCP_PROJECT_ID set
✓ 2/6 GCP_SERVICE_ACCOUNT_KEY set
✓ 3/6 VERCEL_TOKEN set
✓ 4/6 VERCEL_ORG_ID set
✓ 5/6 VERCEL_PROJECT_ID set
✓ 6/6 OPENSSL_SECRET_KEY set
✓ All 6 GitHub Secrets configured!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Step 5: Committing and Deploying
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ Adding encrypted secrets to git...
ℹ Checking git status...
A  secrets.enc

Ready to commit and push? This will trigger deployment. (y/n): y
ℹ Committing changes...
ℹ Pushing to current branch...
✓ Changes pushed to copilot/setup-infrastructure-as-code

✓ 🎉 Setup Complete!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  What happens next:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. GitHub Actions is running now
   → https://github.com/lnwu/learning-english/actions

2. Workflow will:
   → Decrypt secrets.enc using OPENSSL_SECRET_KEY
   → Build your Next.js app
   → Deploy to Vercel

3. Check deployment:
   → Vercel will create a preview URL
   → Test it thoroughly
   → Merge to master when ready

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Your infrastructure is now automated!
```

## What Gets Created

### Files (Local)
- `secrets.enc` - Encrypted secrets (committed to git) ✅
- `.encryption-key` - Your encryption key (DO NOT COMMIT) ⚠️

### GitHub Secrets (6 total)
1. `GCP_PROJECT_ID` - Your GCP project
2. `GCP_SERVICE_ACCOUNT_KEY` - Service account JSON
3. `VERCEL_TOKEN` - Vercel API token
4. `VERCEL_ORG_ID` - Your Vercel org
5. `VERCEL_PROJECT_ID` - Your Vercel project
6. `OPENSSL_SECRET_KEY` - Secret encryption key

### Git Changes
- `secrets.enc` added and committed
- Ready to push to your branch

## Testing

The script pushes to your **current branch**, not master:

```bash
# You're in: copilot/setup-infrastructure-as-code
# Script pushes to: copilot/setup-infrastructure-as-code
# GitHub Actions creates: Preview deployment

# Test the preview URL
# When satisfied: merge to master
```

## No Terraform Required

The script works without Terraform:
- ✅ Creates encrypted secrets
- ✅ Sets GitHub Secrets
- ✅ Triggers deployment
- ⚠️ Skips Terraform if not found

If you want Terraform to manage infrastructure:
1. Let the script complete
2. `cd terraform && terraform init && terraform apply`

## Rotating Secrets Later

Your encryption key is saved in `.encryption-key`:

```bash
# Get your key
KEY=$(cat .encryption-key)

# Decrypt, edit, re-encrypt
openssl enc -aes-256-cbc -d -a -pbkdf2 -in secrets.enc -pass pass:$KEY > secrets.yaml
vim secrets.yaml
cat secrets.yaml | openssl enc -aes-256-cbc -salt -pbkdf2 -a -pass pass:$KEY > secrets.enc
rm secrets.yaml

# Commit and push (auto-deploys)
git add secrets.enc
git commit -m "rotate: Update secrets"
git push origin $(git branch --show-current)
```

## Troubleshooting

### "gh: command not found"
Install GitHub CLI: https://cli.github.com/

### "gh auth required"
Run: `gh auth login`

### "Permission denied: automated-setup.sh"
Run: `chmod +x scripts/automated-setup.sh`

### "File not found: gcp-key.json"
Download service account key from GCP Console

### "openssl: command not found"
OpenSSL is usually pre-installed. On Windows, use Git Bash.

## Summary

**One command. Zero manual steps. Fully automated.**

```bash
./scripts/automated-setup.sh
```

That's it. Your infrastructure is now code, secrets are encrypted, and deployment is automated.

**Time to complete**: 2-3 minutes (just credential entry)  
**Manual steps**: 0 (after gathering credentials)  
**GitHub Secrets**: 6 (down from 14)  
**Downtime**: Acceptable (fresh deployment)

## Next Steps

After script completes:
1. Check GitHub Actions: https://github.com/lnwu/learning-english/actions
2. Test preview deployment in Vercel
3. Merge to master when satisfied

Done! 🎉
