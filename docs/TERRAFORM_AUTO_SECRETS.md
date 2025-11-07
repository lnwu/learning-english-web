# Fully Automated Terraform Setup - Zero Manual Secrets! 🚀

## Overview

This Terraform configuration **automatically generates ALL application secrets** and configures them in Vercel. No manual secret management, no encrypted files, no GitHub Secrets for application credentials.

## What Gets Auto-Generated

When you run `terraform apply`, Terraform automatically:

1. **Creates Firebase Project**
   - Firestore database with security rules
   - Firebase Storage with rules
   - Firebase Web App with configuration

2. **Generates OAuth 2.0 Client**
   - Client ID (auto-generated)
   - Client Secret (auto-generated)
   - Configures Identity Platform

3. **Generates NextAuth Secret**
   - Random 32-character AUTH_SECRET
   - Cryptographically secure

4. **Sets ALL Vercel Environment Variables**
   - `AUTH_SECRET` (generated)
   - `AUTH_GOOGLE_ID` (from OAuth client)
   - `AUTH_GOOGLE_SECRET` (from OAuth client)
   - `NEXT_PUBLIC_FIREBASE_API_KEY` (from Firebase)
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` (from Firebase)
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` (from Firebase)
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` (from Firebase)
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` (from Firebase)
   - `NEXT_PUBLIC_FIREBASE_APP_ID` (from Firebase)
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (from Firebase)

## Setup Steps (5 Minutes)

### 1. Configure Terraform Variables

Copy the example file and edit with your values:

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with these 6 values:

```hcl
# Only provider credentials needed!
gcp_project_id           = "learning-english-477407"
vercel_token             = "your-vercel-api-token"
vercel_org_id            = "your-vercel-org-id"
vercel_project_id        = "your-vercel-project-id"
vercel_production_domain = "learning-english-nine.vercel.app"
```

### 2. Run Terraform

```bash
terraform init
terraform plan   # Review what will be created
terraform apply  # Create everything!
```

Terraform will:
- Create complete Firebase infrastructure
- Generate OAuth credentials
- Generate AUTH_SECRET
- Set all 10 Vercel environment variables
- Deploy Firestore security rules

### 3. Configure OAuth Redirect URIs (One-Time)

After `terraform apply`, you'll see output with instructions:

1. Go to [GCP Credentials Console](https://console.cloud.google.com/apis/credentials?project=learning-english-477407)
2. Click on "Learning English OAuth Client"
3. Add **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - `https://learning-english-nine.vercel.app`
4. Add **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://learning-english-nine.vercel.app/api/auth/callback/google`
5. Click **Save**

### 4. Deploy!

Push to GitHub master branch, and Vercel deploys automatically with all secrets configured:

```bash
git push origin master
```

That's it! Your app is live with full authentication and database access.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Terraform Apply                         │
│  terraform apply → Creates everything automatically         │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│   Firebase   │      │    OAuth     │     │   Secrets    │
│   Module     │      │   Module     │     │  Generator   │
└──────────────┘      └──────────────┘     └──────────────┘
        │                     │                     │
        │                     │                     │
    Creates:              Creates:              Generates:
    • Firestore          • OAuth Client         • AUTH_SECRET
    • Web App            • Client ID/Secret     
    • Storage            • Identity Platform    
    • Security Rules                            
        │                     │                     │
        └─────────────────────┴─────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Vercel Module   │
                    │  Sets ALL 10     │
                    │  Env Variables   │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Vercel Project  │
                    │  Ready to Deploy │
                    └──────────────────┘
```

## What You DON'T Need

❌ No `secrets.enc.yaml` file  
❌ No SOPS encryption  
❌ No manual secret creation  
❌ No GitHub Secrets for app secrets  
❌ No manual Vercel configuration  
❌ No copying/pasting credentials  

## What You DO Need

✅ Only 6 Terraform variables (provider credentials)  
✅ One-time OAuth redirect URI setup  
✅ Terraform state file (keep secure!)  

## Benefits

### 1. Zero Manual Secret Management
- All secrets auto-generated
- No risk of typos or copy/paste errors
- No manual Vercel configuration

### 2. Reproducible Infrastructure
- Delete and recreate everything with `terraform apply`
- All configuration in code
- Easy disaster recovery

### 3. Automatic Updates
- Change OAuth config → `terraform apply`
- Rotate secrets → `terraform apply`
- Update Firebase rules → `terraform apply`

### 4. Simplified Workflow
```bash
# Traditional approach:
# 1. Create Firebase project manually
# 2. Create OAuth client manually
# 3. Copy credentials
# 4. Encrypt credentials
# 5. Set 10+ GitHub Secrets
# 6. Set Vercel environment variables
# 7. Deploy

# Terraform approach:
terraform apply  # Creates everything
# Add OAuth URIs (one-time)
git push         # Deploy
```

## Security

### Terraform State Security

The Terraform state file contains sensitive data (OAuth secrets, etc.). Protect it:

**For Production:**
```hcl
# In main.tf, uncomment:
backend "gcs" {
  bucket = "your-terraform-state-bucket"
  prefix = "terraform/state"
}
```

This stores state in Google Cloud Storage with:
- Encryption at rest
- Access control via IAM
- Version history
- State locking

**For Development:**
- Local state file (default)
- Keep `terraform.tfstate` in `.gitignore`
- Never commit state files

### Secret Rotation

To rotate secrets:

```bash
# For OAuth: Terraform will generate new credentials
terraform taint module.identity_platform.google_iap_client.oauth_client
terraform apply

# For AUTH_SECRET: Force regeneration
terraform taint random_password.auth_secret
terraform apply
```

All Vercel environment variables update automatically!

## Comparing Approaches

### Traditional (Old Way)
- 📝 **Manual Steps**: 15+ manual steps
- 🔐 **Secrets Management**: Encrypted files or GitHub Secrets
- ⏱️ **Time**: 30-60 minutes
- 🎛️ **Configuration**: Manual Vercel env var setup
- 🔄 **Updates**: Manual in multiple places

### Terraform Auto-Generated (New Way)
- 📝 **Manual Steps**: 2 (configure tfvars, add OAuth URIs)
- 🔐 **Secrets Management**: Auto-generated by Terraform
- ⏱️ **Time**: 5 minutes
- 🎛️ **Configuration**: Automatic
- 🔄 **Updates**: `terraform apply`

## Troubleshooting

### OAuth Not Working

**Symptom**: "redirect_uri_mismatch" error

**Solution**: Add redirect URIs in GCP Console:
1. Go to [Credentials](https://console.cloud.google.com/apis/credentials?project=learning-english-477407)
2. Click OAuth client
3. Add redirect URIs (see setup step 3)

### Vercel Environment Variables Not Set

**Symptom**: App doesn't have Firebase config

**Solution**: Check Terraform was applied successfully:
```bash
terraform output vercel_project_url
# Should show: https://learning-english-nine.vercel.app
```

If output is empty, re-apply:
```bash
terraform apply
```

### Firebase Rules Not Deployed

**Symptom**: Firestore permission denied

**Solution**: Check rules were deployed:
```bash
terraform output setup_complete
# Should show "Firestore Database: Created with security rules"
```

Re-apply if needed:
```bash
terraform apply -replace=module.firebase.google_firebaserules_release.firestore
```

## Getting Credentials for terraform.tfvars

### Vercel Token
1. Go to https://vercel.com/account/tokens
2. Create new token
3. Copy and paste into `vercel_token`

### Vercel Org ID
```bash
vercel whoami
# Shows: org_id
```

Or in Vercel dashboard → Settings → General → Team ID

### Vercel Project ID
```bash
vercel project ls
# Find your project's ID
```

Or in Vercel dashboard → Project Settings → General → Project ID

## Next Steps

After setup:

1. **Local Development**:
   ```bash
   # Get env vars from Vercel
   vercel env pull .env.local
   npm run dev
   ```

2. **Production Deployment**:
   ```bash
   git push origin master
   # Vercel deploys automatically
   ```

3. **Monitor**:
   - Firebase Console: https://console.firebase.google.com/
   - Vercel Dashboard: https://vercel.com/dashboard
   - GCP Console: https://console.cloud.google.com/

## FAQ

**Q: Where are the secrets stored?**  
A: In Terraform state file. Use GCS backend for production.

**Q: Can I see the generated OAuth secret?**  
A: Yes: `terraform output -json | jq '.oauth_client_secret.value'`

**Q: How do I rotate secrets?**  
A: `terraform taint <resource>` then `terraform apply`

**Q: What if I lose my Terraform state?**  
A: You'll need to recreate everything or manually import existing resources.

**Q: Can I use this with multiple environments?**  
A: Yes! Use Terraform workspaces or separate state files.

**Q: Do I need GitHub Secrets?**  
A: Only for provider credentials (GCP, Vercel). No application secrets needed!

## Summary

This fully automated approach eliminates manual secret management:

✅ **6 variables** to configure  
✅ **1 command** to create everything  
✅ **2 minutes** for OAuth setup  
✅ **10 secrets** auto-generated  
✅ **0 encrypted files** to manage  

**Total setup time**: 5 minutes  
**Manual secret management**: None!

---

For questions or issues, see the [Terraform documentation](https://www.terraform.io/docs) or [file an issue](https://github.com/lnwu/learning-english/issues).
