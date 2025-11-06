# GitHub Secrets Quick Reference

This guide provides a quick reference for all GitHub Secrets required for the automated deployment pipeline.

## 🔑 Required Secrets

### Google Cloud Platform

#### `GCP_PROJECT_ID`
- **Description**: Your Google Cloud Project ID
- **Format**: String (e.g., `my-project-123456`)
- **How to get**:
  ```bash
  gcloud config get-value project
  ```
- **Example**: `learning-english-prod`

#### `GCP_SERVICE_ACCOUNT_KEY`
- **Description**: JSON key for GitHub Actions service account
- **Format**: Full JSON object (paste entire file content)
- **How to get**:
  ```bash
  gcloud iam service-accounts keys create ~/gcp-key.json \
    --iam-account=github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com
  cat ~/gcp-key.json
  ```
- **Example**: 
  ```json
  {
    "type": "service_account",
    "project_id": "my-project",
    "private_key_id": "...",
    "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
    "client_email": "github-actions-deploy@my-project.iam.gserviceaccount.com",
    "client_id": "...",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    ...
  }
  ```

### Vercel

#### `VERCEL_TOKEN`
- **Description**: Vercel API token for deployment
- **Format**: String token
- **How to get**:
  1. Go to https://vercel.com/account/tokens
  2. Click "Create Token"
  3. Name it "Terraform GitHub Actions"
  4. Copy the generated token
- **Example**: `vercel_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz`

#### `VERCEL_ORG_ID`
- **Description**: Vercel organization or team ID
- **Format**: String starting with `team_`
- **How to get**:
  ```bash
  vercel teams list
  ```
- **Example**: `team_abc123def456ghi789`

#### `VERCEL_PROJECT_ID`
- **Description**: Vercel project ID
- **Format**: String starting with `prj_`
- **How to get**:
  ```bash
  vercel projects list
  ```
- **Example**: `prj_xyz789abc123def456`

### NextAuth / Authentication

#### `AUTH_SECRET`
- **Description**: Secret key for NextAuth session encryption
- **Format**: Base64 encoded random string
- **How to get**:
  ```bash
  openssl rand -base64 32
  ```
- **Example**: `xK7jP9wQ2mL5nR8vT4cG6hB1dF3eY0zA`

#### `AUTH_GOOGLE_ID`
- **Description**: Google OAuth Client ID
- **Format**: String ending with `.apps.googleusercontent.com`
- **How to get**:
  1. Go to https://console.cloud.google.com/apis/credentials
  2. Select your OAuth 2.0 Client ID
  3. Copy the "Client ID"
- **Example**: `123456789-abc123def456ghi789.apps.googleusercontent.com`

#### `AUTH_GOOGLE_SECRET`
- **Description**: Google OAuth Client Secret
- **Format**: String starting with `GOCSPX-`
- **How to get**:
  1. Go to https://console.cloud.google.com/apis/credentials
  2. Select your OAuth 2.0 Client ID
  3. Copy the "Client secret"
- **Example**: `GOCSPX-abc123def456ghi789jkl012`

### Firebase

#### `FIREBASE_PROJECT_ID`
- **Description**: Firebase project identifier
- **Format**: String (lowercase with hyphens)
- **How to get**:
  1. Go to https://console.firebase.google.com/
  2. Select project → Settings (gear icon)
  3. General tab → "Project ID"
- **Example**: `learning-english-12345`

#### `FIREBASE_API_KEY`
- **Description**: Firebase Web API Key
- **Format**: String starting with `AIza`
- **How to get**:
  1. Firebase Console → Project Settings
  2. General tab → Your apps section
  3. Web app → Config → "apiKey"
- **Example**: `AIzaSyAbcDefGhiJklMnoPqrStUvWxYz012345`

#### `FIREBASE_AUTH_DOMAIN`
- **Description**: Firebase authentication domain
- **Format**: `{project-id}.firebaseapp.com`
- **How to get**:
  1. Firebase Console → Project Settings
  2. General tab → Your apps → "authDomain"
- **Example**: `learning-english-12345.firebaseapp.com`

#### `FIREBASE_STORAGE_BUCKET`
- **Description**: Firebase Cloud Storage bucket
- **Format**: `{project-id}.firebasestorage.app` or `.appspot.com`
- **How to get**:
  1. Firebase Console → Project Settings
  2. General tab → Your apps → "storageBucket"
- **Example**: `learning-english-12345.firebasestorage.app`

#### `FIREBASE_MESSAGING_SENDER_ID`
- **Description**: Firebase Cloud Messaging sender ID
- **Format**: Numeric string
- **How to get**:
  1. Firebase Console → Project Settings
  2. Cloud Messaging tab → "Sender ID"
  3. Or General tab → Your apps → "messagingSenderId"
- **Example**: `123456789012`

#### `FIREBASE_APP_ID`
- **Description**: Firebase app identifier
- **Format**: `1:{number}:web:{hash}`
- **How to get**:
  1. Firebase Console → Project Settings
  2. General tab → Your apps → "appId"
- **Example**: `1:123456789012:web:abc123def456ghi789`

#### `FIREBASE_MEASUREMENT_ID`
- **Description**: Google Analytics measurement ID (optional)
- **Format**: `G-{alphanumeric}`
- **How to get**:
  1. Firebase Console → Project Settings
  2. General tab → Your apps → "measurementId"
  3. Only if Google Analytics is enabled
- **Example**: `G-ABC123DEF4`

## 📋 Quick Setup Checklist

```bash
# 1. Set all secrets at once using GitHub CLI
gh secret set GCP_PROJECT_ID --body "YOUR_PROJECT_ID"
gh secret set GCP_SERVICE_ACCOUNT_KEY < ~/gcp-key.json
gh secret set VERCEL_TOKEN --body "YOUR_VERCEL_TOKEN"
gh secret set VERCEL_ORG_ID --body "YOUR_ORG_ID"
gh secret set VERCEL_PROJECT_ID --body "YOUR_PROJECT_ID"
gh secret set AUTH_SECRET --body "$(openssl rand -base64 32)"
gh secret set AUTH_GOOGLE_ID --body "YOUR_GOOGLE_CLIENT_ID"
gh secret set AUTH_GOOGLE_SECRET --body "YOUR_GOOGLE_CLIENT_SECRET"
gh secret set FIREBASE_PROJECT_ID --body "YOUR_FIREBASE_PROJECT_ID"
gh secret set FIREBASE_API_KEY --body "YOUR_FIREBASE_API_KEY"
gh secret set FIREBASE_AUTH_DOMAIN --body "YOUR_FIREBASE_AUTH_DOMAIN"
gh secret set FIREBASE_STORAGE_BUCKET --body "YOUR_FIREBASE_STORAGE_BUCKET"
gh secret set FIREBASE_MESSAGING_SENDER_ID --body "YOUR_SENDER_ID"
gh secret set FIREBASE_APP_ID --body "YOUR_APP_ID"
gh secret set FIREBASE_MEASUREMENT_ID --body "YOUR_MEASUREMENT_ID"

# 2. Verify all secrets are set
gh secret list
```

## 🔍 Verification

After setting all secrets, verify they're correctly configured:

```bash
# List all secrets (values are hidden for security)
gh secret list --repo lnwu/learning-english

# Expected output:
# GCP_PROJECT_ID             Updated 2024-XX-XX
# GCP_SERVICE_ACCOUNT_KEY    Updated 2024-XX-XX
# VERCEL_TOKEN               Updated 2024-XX-XX
# VERCEL_ORG_ID              Updated 2024-XX-XX
# VERCEL_PROJECT_ID          Updated 2024-XX-XX
# AUTH_SECRET                Updated 2024-XX-XX
# AUTH_GOOGLE_ID             Updated 2024-XX-XX
# AUTH_GOOGLE_SECRET         Updated 2024-XX-XX
# FIREBASE_PROJECT_ID        Updated 2024-XX-XX
# FIREBASE_API_KEY           Updated 2024-XX-XX
# FIREBASE_AUTH_DOMAIN       Updated 2024-XX-XX
# FIREBASE_STORAGE_BUCKET    Updated 2024-XX-XX
# FIREBASE_MESSAGING_SENDER_ID Updated 2024-XX-XX
# FIREBASE_APP_ID            Updated 2024-XX-XX
# FIREBASE_MEASUREMENT_ID    Updated 2024-XX-XX
```

## 🔄 Updating Secrets

### Update a single secret
```bash
gh secret set SECRET_NAME --body "new-value"
```

### Update service account key
```bash
# Generate new key
gcloud iam service-accounts keys create ~/new-gcp-key.json \
  --iam-account=github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Update GitHub secret
gh secret set GCP_SERVICE_ACCOUNT_KEY < ~/new-gcp-key.json

# Delete old key (find key ID first)
gcloud iam service-accounts keys list \
  --iam-account=github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com

gcloud iam service-accounts keys delete KEY_ID \
  --iam-account=github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### Rotate auth secret
```bash
# Generate new secret
NEW_SECRET=$(openssl rand -base64 32)

# Update in GitHub
gh secret set AUTH_SECRET --body "$NEW_SECRET"

# Update in Vercel via Terraform or manually
# Then redeploy application
```

## 🚨 Security Best Practices

1. **Never commit secrets to git**
   - All secrets are in `.gitignore`
   - Use GitHub Secrets for CI/CD
   - Use environment variables locally

2. **Rotate secrets regularly**
   - Service account keys: Every 90 days
   - API tokens: Every 6 months
   - Auth secrets: Annually or when compromised

3. **Use least privilege principle**
   - Service accounts: Only necessary permissions
   - API tokens: Minimum required scope
   - Limit access to production secrets

4. **Monitor secret usage**
   ```bash
   # Check service account activity
   gcloud logging read "protoPayload.authenticationInfo.principalEmail=github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --limit 50
   
   # Check API token usage in Vercel dashboard
   ```

5. **Backup recovery information**
   - Document where each secret comes from
   - Keep copy of configuration in secure location
   - Test recovery procedures

## ⚠️ Troubleshooting

### Secret not working after update

**Issue**: Updated secret but deployment still fails

**Solution**:
1. Verify secret was updated: `gh secret list`
2. Check for typos in secret name
3. Ensure no extra whitespace in secret value
4. Wait a few minutes for propagation
5. Re-run the workflow

### Invalid JSON for GCP_SERVICE_ACCOUNT_KEY

**Issue**: `Error parsing service account key`

**Solution**:
```bash
# Ensure you're pasting the entire JSON file
cat ~/gcp-key.json | gh secret set GCP_SERVICE_ACCOUNT_KEY

# Verify JSON is valid
cat ~/gcp-key.json | jq .
```

### Vercel token expired

**Issue**: `Error: Unauthorized`

**Solution**:
1. Create new token: https://vercel.com/account/tokens
2. Update secret: `gh secret set VERCEL_TOKEN --body "new-token"`
3. Re-run deployment

## 📚 Related Documentation

- [Full Infrastructure Setup Guide](./INFRASTRUCTURE_SETUP.md)
- [Terraform README](../terraform/README.md)
- [GitHub Actions Workflow](../.github/workflows/deploy.yml)
- [Security Best Practices](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

## 🆘 Need Help?

If you need assistance:

1. Review error messages in GitHub Actions logs
2. Check that all secrets are set: `gh secret list`
3. Verify secret values are correct (can't view, but can regenerate)
4. Consult the troubleshooting sections
5. Open an issue with error details

Remember: Never share secret values in public issues or forums!
