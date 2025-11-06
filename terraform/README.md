# Terraform Infrastructure as Code

This directory contains Terraform configuration for automating the deployment of the Learning English application infrastructure.

## 📋 Overview

This Terraform setup provisions and manages:

- **Google Cloud Secret Manager**: Encrypted storage for sensitive credentials
- **Firebase Configuration**: Project setup and authentication
- **Vercel Deployment**: Automated deployment with environment variables
- **IAM Permissions**: Service accounts and access controls
- **GitHub Actions Integration**: CI/CD pipeline for automated deployments

## 🏗️ Architecture

```
┌─────────────────┐
│ GitHub Actions  │
│   (CI/CD)       │
└────────┬────────┘
         │
         ├──────────────────────┐
         │                      │
         ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│ Google Cloud    │    │ Vercel          │
│ ├─ Secret Mgr   │    │ ├─ Project      │
│ ├─ Firebase     │    │ ├─ Env Vars     │
│ └─ IAM          │    │ └─ Deployment   │
└─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

1. **Install Terraform** (>= 1.5.0)
   ```bash
   # macOS
   brew install terraform
   
   # Linux
   wget https://releases.hashicorp.com/terraform/1.5.0/terraform_1.5.0_linux_amd64.zip
   unzip terraform_1.5.0_linux_amd64.zip
   sudo mv terraform /usr/local/bin/
   ```

2. **Install Google Cloud SDK**
   ```bash
   # macOS
   brew install google-cloud-sdk
   
   # Linux
   curl https://sdk.cloud.google.com | bash
   ```

3. **Authenticate with Google Cloud**
   ```bash
   gcloud auth application-default login
   gcloud config set project YOUR_PROJECT_ID
   ```

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/lnwu/learning-english.git
   cd learning-english/terraform
   ```

2. **Create your variables file**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

3. **Edit `terraform.tfvars` with your credentials**
   ```bash
   # Use your favorite editor
   vim terraform.tfvars
   ```

4. **Initialize Terraform**
   ```bash
   terraform init
   ```

5. **Review the plan**
   ```bash
   terraform plan
   ```

6. **Apply the configuration**
   ```bash
   terraform apply
   ```

### Production State Management (Recommended)

For production environments, it's strongly recommended to use remote state storage:

1. **Create a GCS bucket for Terraform state**
   ```bash
   # Create bucket
   gsutil mb -p YOUR_PROJECT_ID -l us-central1 gs://YOUR_PROJECT_ID-terraform-state
   
   # Enable versioning
   gsutil versioning set on gs://YOUR_PROJECT_ID-terraform-state
   
   # Set lifecycle policy to keep versions
   cat > lifecycle.json << EOF
   {
     "lifecycle": {
       "rule": [
         {
           "action": {"type": "Delete"},
           "condition": {
             "numNewerVersions": 10,
             "isLive": false
           }
         }
       ]
     }
   }
   EOF
   gsutil lifecycle set lifecycle.json gs://YOUR_PROJECT_ID-terraform-state
   ```

2. **Configure backend in `main.tf`**
   ```hcl
   terraform {
     backend "gcs" {
       bucket = "YOUR_PROJECT_ID-terraform-state"
       prefix = "terraform/state"
     }
   }
   ```

3. **Migrate existing state (if you already ran terraform apply)**
   ```bash
   terraform init -migrate-state
   ```

**Benefits of remote state:**
- ✅ State file is encrypted at rest
- ✅ State locking prevents concurrent modifications
- ✅ Versioning allows rollback
- ✅ Shared across team members
- ✅ Automatically backed up

**⚠️ Warning:** Local state files contain sensitive information (secrets, IDs) and should never be committed to version control.

## 🔑 Required Credentials

### Google Cloud

1. **Create a GCP Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Note the Project ID

2. **Enable Required APIs**
   ```bash
   gcloud services enable secretmanager.googleapis.com
   gcloud services enable firebase.googleapis.com
   gcloud services enable firestore.googleapis.com
   gcloud services enable identitytoolkit.googleapis.com
   ```

3. **Create Service Account for GitHub Actions**
   ```bash
   # Create service account
   gcloud iam service-accounts create github-actions-deploy \
     --display-name="GitHub Actions Deployment"
   
   # Grant necessary permissions
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/secretmanager.admin"
   
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/firebase.admin"
   
   # Create and download key
   gcloud iam service-accounts keys create ~/gcp-key.json \
     --iam-account=github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

### Firebase

1. **Set up Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your Google Cloud project (or create new Firebase project)
   - Go to Project Settings → General
   - Scroll down to "Your apps" section
   - Click "Add app" → Web (</>) icon
   - Register your app and copy the configuration values

2. **Copy Firebase Configuration**
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID
   - Measurement ID

### Vercel

1. **Create Vercel Account**
   - Go to [Vercel](https://vercel.com)
   - Sign up or log in

2. **Create Project** (if not exists)
   - Import from GitHub repository
   - Note the Project ID and Organization ID

3. **Generate API Token**
   - Go to Settings → Tokens
   - Create new token with appropriate permissions
   - Copy the token

4. **Get Organization and Project IDs**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login
   vercel login
   
   # List projects to get IDs
   vercel projects list
   
   # Get organization ID
   vercel teams list
   ```

### Google OAuth

1. **Set up OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Configure consent screen
   - Add authorized redirect URIs
   - Copy Client ID and Client Secret

### NextAuth Secret

```bash
# Generate a secure random secret
openssl rand -base64 32
```

## 📝 Configuration Files

### terraform.tfvars

This file contains your actual credentials (NEVER commit this to git):

```hcl
gcp_project_id = "my-project-123456"
gcp_region     = "us-central1"

vercel_token       = "your-vercel-token"
vercel_org_id      = "team_xxxxxxxxxxxxx"
vercel_project_id  = "prj_xxxxxxxxxxxxx"

auth_secret        = "generated-secret-from-openssl"
auth_google_id     = "xxxxx.apps.googleusercontent.com"
auth_google_secret = "GOCSPX-xxxxxxxxxxxxx"

firebase_project_id          = "my-firebase-project"
firebase_api_key             = "AIzaSyXXXXXXXXXXXXXXX"
firebase_auth_domain         = "my-project.firebaseapp.com"
firebase_storage_bucket      = "my-project.firebasestorage.app"
firebase_messaging_sender_id = "123456789"
firebase_app_id              = "1:123456:web:abc123"
firebase_measurement_id      = "G-XXXXXXXXXX"
```

## 🔐 GitHub Secrets Setup

After running Terraform, configure these secrets in your GitHub repository:

1. Go to your repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add the following secrets:

| Secret Name | Description | Where to get it |
|------------|-------------|-----------------|
| `GCP_PROJECT_ID` | Google Cloud Project ID | GCP Console → Dashboard |
| `GCP_SERVICE_ACCOUNT_KEY` | Service account JSON key | Created in setup step above |
| `VERCEL_TOKEN` | Vercel API token | Vercel → Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel organization ID | From `vercel teams list` |
| `VERCEL_PROJECT_ID` | Vercel project ID | From `vercel projects list` |
| `AUTH_SECRET` | NextAuth secret | From `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID | GCP Console → APIs & Services → Credentials |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret | GCP Console → APIs & Services → Credentials |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Firebase Console → Project Settings |
| `FIREBASE_API_KEY` | Firebase API key | Firebase Console → Project Settings → Web API Key |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Firebase Console → Authentication → Settings |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Firebase Console → Storage |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Firebase Console → Project Settings → Cloud Messaging |
| `FIREBASE_APP_ID` | Firebase app ID | Firebase Console → Project Settings → Your apps |
| `FIREBASE_MEASUREMENT_ID` | Firebase measurement ID | Firebase Console → Project Settings → Google Analytics |

## 🔄 Deployment Workflow

Once GitHub secrets are configured, the deployment workflow will automatically:

1. **On Pull Request**:
   - Run Terraform plan
   - Show what changes will be made
   - Validate configuration

2. **On Merge to Master**:
   - Run linting and build checks
   - Apply Terraform configuration
   - Update secrets in Google Cloud Secret Manager
   - Configure Vercel environment variables
   - Deploy to Vercel production

## 📦 Module Structure

```
terraform/
├── main.tf                    # Main configuration
├── variables.tf               # Input variables
├── outputs.tf                 # Output values
├── terraform.tfvars.example   # Example variables file
└── modules/
    ├── secret-manager/        # Google Cloud Secret Manager
    │   └── main.tf
    └── vercel/                # Vercel deployment
        └── main.tf
```

## 🔍 Common Commands

```bash
# Initialize Terraform
terraform init

# Format Terraform files
terraform fmt

# Validate configuration
terraform validate

# Plan changes
terraform plan

# Apply changes
terraform apply

# Show current state
terraform show

# List resources
terraform state list

# Destroy infrastructure (use with caution!)
terraform destroy
```

## 🛠️ Troubleshooting

### Error: "API not enabled"

**Solution**: Enable required APIs manually or run:
```bash
gcloud services enable secretmanager.googleapis.com
gcloud services enable firebase.googleapis.com
```

### Error: "Permission denied"

**Solution**: Ensure service account has necessary permissions:
```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.admin"
```

### Error: "Backend initialization required"

**Solution**: Initialize Terraform:
```bash
terraform init
```

### Vercel deployment fails

**Solution**: 
1. Verify Vercel token is valid
2. Check project and organization IDs are correct
3. Ensure project exists in Vercel dashboard

### Secret Manager access denied

**Solution**: Check IAM permissions for the service account:
```bash
gcloud projects get-iam-policy YOUR_PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com"
```

## 🔒 Security Best Practices

1. **Never commit sensitive files**:
   - `terraform.tfvars`
   - `*.tfstate`
   - `*.tfstate.backup`
   - Service account keys
   
2. **Use separate credentials for dev/staging/production**

3. **Rotate secrets regularly**:
   ```bash
   # Update secret in Secret Manager
   gcloud secrets versions add SECRET_NAME --data-file=new-secret.txt
   ```

4. **Enable Cloud Audit Logs** for Secret Manager access

5. **Use least privilege principle** for service accounts

6. **Enable Secret Manager automatic replication** for high availability

## 📚 Additional Resources

- [Terraform Documentation](https://www.terraform.io/docs)
- [Google Cloud Secret Manager](https://cloud.google.com/secret-manager/docs)
- [Vercel API Documentation](https://vercel.com/docs/rest-api)
- [Firebase Setup Guide](https://firebase.google.com/docs/web/setup)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🤝 Contributing

When modifying Terraform configuration:

1. Test changes locally with `terraform plan`
2. Validate with `terraform validate`
3. Format code with `terraform fmt`
4. Document any new variables or outputs
5. Update this README with new setup steps

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.
