# Infrastructure as Code Setup Guide

Complete guide for setting up automated deployment using Terraform, Google Cloud, Firebase, and Vercel.

## 🎯 Goal

Set up a fully automated deployment pipeline where:
- Infrastructure is defined as code using Terraform
- Secrets are encrypted and stored in Google Cloud Secret Manager
- Deployment is triggered automatically when code is merged to master
- All credentials are managed through GitHub Secrets
- Zero manual configuration needed after initial setup

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] GitHub repository access (owner/admin permissions)
- [ ] Google Cloud account with billing enabled
- [ ] Vercel account
- [ ] Firebase project (or will create one)
- [ ] Local development environment with:
  - [ ] Terraform >= 1.5.0
  - [ ] Google Cloud SDK
  - [ ] Node.js >= 18
  - [ ] Git

## 🚀 Step-by-Step Setup

### Phase 1: Google Cloud Setup (30 minutes)

#### 1.1 Create Google Cloud Project

```bash
# Install gcloud CLI if not already installed
# macOS: brew install google-cloud-sdk
# Linux: curl https://sdk.cloud.google.com | bash

# Login to Google Cloud
gcloud auth login

# Create a new project
gcloud projects create YOUR_PROJECT_ID --name="Learning English"

# Set as active project
gcloud config set project YOUR_PROJECT_ID

# Enable billing (required for APIs)
# Go to: https://console.cloud.google.com/billing
# Link billing account to your project
```

#### 1.2 Enable Required APIs

```bash
# Enable all necessary Google Cloud APIs
gcloud services enable secretmanager.googleapis.com
gcloud services enable firebase.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable identitytoolkit.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable iam.googleapis.com
```

#### 1.3 Create Service Account for GitHub Actions

```bash
# Create service account
gcloud iam service-accounts create github-actions-deploy \
  --display-name="GitHub Actions Deployment" \
  --description="Service account for CI/CD pipeline"

# Get project number
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")

# Grant Secret Manager Admin role
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.admin"

# Grant Firebase Admin role
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/firebase.admin"

# Grant Service Account Token Creator role (for impersonation)
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountTokenCreator"

# Create and download service account key
gcloud iam service-accounts keys create ~/gcp-key.json \
  --iam-account=github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Display key content (you'll need to copy this to GitHub Secrets)
cat ~/gcp-key.json
```

**⚠️ Important**: Save the JSON key content securely. You'll add it to GitHub Secrets.

#### 1.4 Setup Google OAuth Credentials

```bash
# Go to Google Cloud Console
# https://console.cloud.google.com/apis/credentials

# 1. Configure OAuth Consent Screen:
#    - User Type: External
#    - App name: Learning English
#    - User support email: your-email@example.com
#    - Developer contact: your-email@example.com
#    - Add test users (your email)

# 2. Create OAuth 2.0 Client ID:
#    - Application type: Web application
#    - Name: Learning English Web Client
#    - Authorized JavaScript origins:
#      - http://localhost:3000
#      - https://your-domain.vercel.app
#    - Authorized redirect URIs:
#      - http://localhost:3000/api/auth/callback/google
#      - https://your-domain.vercel.app/api/auth/callback/google

# 3. Copy Client ID and Client Secret
```

### Phase 2: Firebase Setup (15 minutes)

#### 2.1 Create Firebase Project

```bash
# Option 1: Use existing GCP project
# Go to: https://console.firebase.google.com/
# Click "Add project"
# Select your existing Google Cloud project
# Enable Google Analytics (optional)

# Option 2: Create new Firebase project
# This will also create a new GCP project
```

#### 2.2 Get Firebase Configuration

```bash
# Go to Firebase Console: https://console.firebase.google.com/
# Select your project
# Click gear icon → Project settings
# Scroll to "Your apps" section
# Click "</>" (Web) icon to add a web app

# Register app:
#   - App nickname: Learning English Web
#   - Enable Firebase Hosting: No (using Vercel)

# Copy the configuration values:
#   - API Key
#   - Auth Domain
#   - Project ID
#   - Storage Bucket
#   - Messaging Sender ID
#   - App ID
#   - Measurement ID (if Analytics enabled)
```

#### 2.3 Enable Firebase Authentication

```bash
# Go to Firebase Console → Authentication
# Click "Get started"
# Enable "Google" sign-in provider
# Use the same OAuth Client ID from GCP setup
```

#### 2.4 Setup Firestore Database

```bash
# Go to Firebase Console → Firestore Database
# Click "Create database"
# Start in production mode
# Choose location (same as GCP region, e.g., us-central1)

# Set up security rules (can be done via Terraform later)
```

### Phase 3: Vercel Setup (10 minutes)

#### 3.1 Create Vercel Account and Project

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link your GitHub repository
# Go to: https://vercel.com/new
# Import your GitHub repository: lnwu/learning-english
# Click "Import"
# Configure project:
#   - Framework Preset: Next.js
#   - Root Directory: ./
#   - Build Command: npm run build
#   - Output Directory: .next
# Click "Deploy" (will fail first time, that's ok)
```

#### 3.2 Get Vercel IDs and Token

```bash
# Get Team/Organization ID
vercel teams list
# Copy the "id" value (starts with "team_")

# Get Project ID
vercel projects list
# Copy the "id" for learning-english project (starts with "prj_")

# Create API Token
# Go to: https://vercel.com/account/tokens
# Click "Create Token"
# Name: "Terraform GitHub Actions"
# Scope: Full Account or specific teams
# Expiration: No Expiration (or set as needed)
# Click "Create Token"
# Copy the token immediately (won't be shown again)
```

### Phase 4: Local Terraform Setup (15 minutes)

#### 4.1 Install Terraform

```bash
# macOS
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# Linux
wget https://releases.hashicorp.com/terraform/1.5.0/terraform_1.5.0_linux_amd64.zip
unzip terraform_1.5.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/
rm terraform_1.5.0_linux_amd64.zip

# Verify installation
terraform --version
```

#### 4.2 Configure Terraform Variables

```bash
# Navigate to terraform directory
cd terraform

# Copy example variables file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
vim terraform.tfvars
```

**terraform.tfvars content**:
```hcl
# Google Cloud Configuration
gcp_project_id = "YOUR_PROJECT_ID"
gcp_region     = "us-central1"

# GitHub Configuration
github_repo = "lnwu/learning-english"

# Vercel Configuration
vercel_token       = "YOUR_VERCEL_TOKEN"
vercel_org_id      = "team_xxxxxxxxxxxxx"
vercel_project_id  = "prj_xxxxxxxxxxxxx"
vercel_project_name = "learning-english"

# NextAuth Configuration
auth_secret        = "GENERATED_SECRET"  # Run: openssl rand -base64 32
auth_google_id     = "xxxxx.apps.googleusercontent.com"
auth_google_secret = "GOCSPX-xxxxxxxxxxxxx"

# Firebase Configuration
firebase_project_id          = "YOUR_FIREBASE_PROJECT_ID"
firebase_api_key             = "AIzaSyXXXXXXXXXXXXXXX"
firebase_auth_domain         = "YOUR_PROJECT.firebaseapp.com"
firebase_storage_bucket      = "YOUR_PROJECT.firebasestorage.app"
firebase_messaging_sender_id = "123456789"
firebase_app_id              = "1:123456:web:abc123"
firebase_measurement_id      = "G-XXXXXXXXXX"
```

#### 4.3 Generate NextAuth Secret

```bash
# Generate secure random secret
openssl rand -base64 32

# Copy output and add to terraform.tfvars as auth_secret value
```

#### 4.4 Initialize and Test Terraform

```bash
# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Format Terraform files
terraform fmt

# Review planned changes
terraform plan

# If everything looks good, apply (optional for local test)
# terraform apply
```

### Phase 5: GitHub Secrets Configuration (10 minutes)

#### 5.1 Add Repository Secrets

Go to your GitHub repository:
```
https://github.com/lnwu/learning-english/settings/secrets/actions
```

Click "New repository secret" for each of these:

| Secret Name | Value | Notes |
|------------|-------|-------|
| `GCP_PROJECT_ID` | Your Google Cloud Project ID | From `gcloud config get-value project` |
| `GCP_SERVICE_ACCOUNT_KEY` | Contents of `~/gcp-key.json` | Full JSON key content |
| `VERCEL_TOKEN` | Your Vercel API token | From Vercel account settings |
| `VERCEL_ORG_ID` | Your Vercel organization ID | From `vercel teams list` |
| `VERCEL_PROJECT_ID` | Your Vercel project ID | From `vercel projects list` |
| `AUTH_SECRET` | Generated NextAuth secret | From `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID | From GCP credentials page |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret | From GCP credentials page |
| `FIREBASE_PROJECT_ID` | Firebase project ID | From Firebase console |
| `FIREBASE_API_KEY` | Firebase API key | From Firebase project settings |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain | From Firebase project settings |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | From Firebase project settings |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | From Firebase project settings |
| `FIREBASE_APP_ID` | Firebase app ID | From Firebase project settings |
| `FIREBASE_MEASUREMENT_ID` | Firebase measurement ID | From Firebase project settings (if Analytics enabled) |

#### 5.2 Verify Secrets

```bash
# List configured secrets (values are hidden)
gh secret list --repo lnwu/learning-english
```

### Phase 6: Test Deployment (20 minutes)

#### 6.1 Test Pull Request Workflow

```bash
# Create a test branch
git checkout -b test-terraform-setup

# Make a small change
echo "# Testing Terraform deployment" >> terraform/TEST.md

# Commit and push
git add .
git commit -m "Test: Terraform setup validation"
git push origin test-terraform-setup

# Create pull request on GitHub
# Check Actions tab to see Terraform plan running
```

#### 6.2 Merge to Master

```bash
# After PR is approved and Terraform plan looks good:
# Merge the PR via GitHub UI

# Monitor deployment
# Go to: https://github.com/lnwu/learning-english/actions
# Watch the "Deploy to Vercel" workflow execute

# Check steps:
# ✓ Lint code
# ✓ Build application
# ✓ Terraform apply
# ✓ Deploy to Vercel
```

#### 6.3 Verify Deployment

```bash
# Check Vercel deployment
vercel ls

# Visit your deployed application
# https://learning-english.vercel.app (or your custom domain)

# Test authentication
# 1. Try signing in with Google
# 2. Add a word
# 3. Practice vocabulary
# 4. Check that data persists
```

## 🔧 Troubleshooting

### Common Issues

#### Issue: "API not enabled"

**Error**: `Error 403: Secret Manager API has not been used in project`

**Solution**:
```bash
gcloud services enable secretmanager.googleapis.com --project=YOUR_PROJECT_ID
```

#### Issue: "Permission denied on Secret Manager"

**Error**: `Error: Error creating Secret: googleapi: Error 403: Permission denied`

**Solution**:
```bash
# Grant Secret Manager Admin role
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.admin"
```

#### Issue: "Vercel project not found"

**Error**: `Error: project not found`

**Solution**:
1. Verify project exists: `vercel projects list`
2. Check VERCEL_PROJECT_ID matches
3. Ensure VERCEL_TOKEN has correct permissions

#### Issue: "OAuth redirect URI mismatch"

**Error**: `Error: redirect_uri_mismatch`

**Solution**:
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Edit OAuth 2.0 Client ID
3. Add exact redirect URI: `https://your-domain.vercel.app/api/auth/callback/google`
4. Wait 5 minutes for changes to propagate

#### Issue: "Terraform state lock"

**Error**: `Error: Error acquiring the state lock`

**Solution**:
```bash
# If you're sure no other process is running Terraform:
terraform force-unlock LOCK_ID
```

## 🔒 Security Best Practices

### Secret Management

1. **Never commit sensitive files**:
   ```bash
   # Already in .gitignore:
   terraform/*.tfvars
   terraform/*.tfstate
   *.pem
   .env*
   ```

2. **Rotate secrets regularly**:
   ```bash
   # Generate new secret
   NEW_SECRET=$(openssl rand -base64 32)
   
   # Update in GitHub Secrets
   gh secret set AUTH_SECRET --body "$NEW_SECRET"
   
   # Update in terraform.tfvars
   # Run terraform apply to update Secret Manager
   ```

3. **Use separate credentials per environment**:
   - Development: Local `.env.local`
   - Staging: Separate Vercel project with staging secrets
   - Production: Production secrets via Terraform

4. **Enable audit logging**:
   ```bash
   # Enable Cloud Audit Logs for Secret Manager
   gcloud logging read "resource.type=secretmanager.googleapis.com/Secret" \
     --limit 10 \
     --format json
   ```

### Access Control

1. **Principle of least privilege**:
   - GitHub Actions service account: Only secretmanager.admin and firebase.admin
   - Developers: Read-only access to production secrets
   - Use separate service accounts for different environments

2. **Monitor access**:
   ```bash
   # View IAM policy
   gcloud projects get-iam-policy YOUR_PROJECT_ID
   
   # Audit service account usage
   gcloud logging read "protoPayload.authenticationInfo.principalEmail=github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com"
   ```

## 📊 Maintenance

### Regular Tasks

#### Monthly
- Review and rotate API tokens
- Update Terraform provider versions
- Check for deprecated APIs
- Review access logs

#### Quarterly
- Audit IAM permissions
- Review cost optimization
- Update documentation
- Test disaster recovery

### Updating Secrets

```bash
# Update a secret in Secret Manager
echo -n "new-secret-value" | gcloud secrets versions add SECRET_NAME --data-file=-

# Update GitHub Secret
gh secret set SECRET_NAME --body "new-value"

# Update Vercel environment variable
vercel env rm VARIABLE_NAME production
vercel env add VARIABLE_NAME production
```

### Backup and Recovery

```bash
# Backup Terraform state (if using local state)
cp terraform.tfstate terraform.tfstate.backup-$(date +%Y%m%d)

# Export all secrets (for backup)
for secret in $(gcloud secrets list --format="value(name)"); do
  echo "Backing up $secret"
  gcloud secrets versions access latest --secret="$secret" > "backup-$secret.txt"
done
```

## 🎉 Success Criteria

You've successfully completed the setup when:

- [x] Terraform can successfully apply configuration locally
- [x] All GitHub Secrets are configured
- [x] Pull requests trigger Terraform plan
- [x] Merging to master automatically deploys to Vercel
- [x] Secrets are encrypted in Google Cloud Secret Manager
- [x] Application is accessible at Vercel URL
- [x] Google OAuth authentication works
- [x] Firebase features work correctly
- [x] No manual configuration needed for deployments

## 📚 Additional Resources

- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)
- [Google Cloud Secret Manager](https://cloud.google.com/secret-manager/docs/best-practices)
- [Vercel CI/CD](https://vercel.com/docs/concepts/deployments/overview)
- [GitHub Actions Security](https://docs.github.com/en/actions/security-guides)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

## 🆘 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review GitHub Actions logs
3. Check Terraform output for errors
4. Consult individual service documentation
5. Open an issue in the repository

## 📝 Next Steps

After successful setup:

1. **Set up staging environment**
   - Create separate Vercel project
   - Use different Firebase project
   - Configure staging secrets

2. **Implement monitoring**
   - Set up Google Cloud Monitoring
   - Configure Vercel analytics
   - Add error tracking (Sentry, etc.)

3. **Add database backups**
   - Configure Firestore backups
   - Set up automated backup schedule

4. **Implement rollback procedures**
   - Document rollback process
   - Test rollback scenarios
   - Keep previous Terraform states

Congratulations! You now have a fully automated, infrastructure-as-code deployment pipeline! 🚀
