#!/bin/bash

# Infrastructure Setup Helper Script
# This script helps gather the necessary information for Terraform setup

set -e

echo "=================================================="
echo "  Learning English - Infrastructure Setup Helper"
echo "=================================================="
echo ""
echo "This script will help you gather all the necessary"
echo "information for setting up infrastructure as code."
echo ""
echo "Prerequisites:"
echo "  ✓ Google Cloud SDK installed (gcloud)"
echo "  ✓ Vercel CLI installed (vercel)"
echo "  ✓ GitHub CLI installed (gh)"
echo "  ✓ Terraform installed"
echo ""
read -p "Press Enter to continue..."

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${NC}$1${NC}"
}

# Check prerequisites
echo ""
echo "Checking prerequisites..."
echo ""

check_command() {
    if command -v $1 &> /dev/null; then
        print_success "$1 is installed"
        return 0
    else
        print_error "$1 is not installed"
        return 1
    fi
}

all_deps_ok=true
check_command "gcloud" || all_deps_ok=false
check_command "vercel" || all_deps_ok=false
check_command "gh" || all_deps_ok=false
check_command "terraform" || all_deps_ok=false
check_command "openssl" || all_deps_ok=false

if [ "$all_deps_ok" = false ]; then
    print_error "Please install missing dependencies before continuing"
    exit 1
fi

echo ""
echo "=================================================="
echo "  Step 1: Google Cloud Configuration"
echo "=================================================="
echo ""

# Get GCP project ID
read -p "Enter your Google Cloud Project ID: " GCP_PROJECT_ID
gcloud config set project $GCP_PROJECT_ID

print_info "Enabling required APIs..."
gcloud services enable secretmanager.googleapis.com
gcloud services enable firebase.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable identitytoolkit.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable iam.googleapis.com
print_success "APIs enabled"

echo ""
echo "=================================================="
echo "  Step 2: Service Account Setup"
echo "=================================================="
echo ""

SA_NAME="github-actions-deploy"
SA_EMAIL="${SA_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"

print_info "Checking if service account exists..."
if gcloud iam service-accounts describe $SA_EMAIL &> /dev/null; then
    print_warning "Service account already exists: $SA_EMAIL"
else
    print_info "Creating service account..."
    gcloud iam service-accounts create $SA_NAME \
        --display-name="GitHub Actions Deployment" \
        --description="Service account for CI/CD pipeline"
    print_success "Service account created"
fi

print_info "Granting permissions..."
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/secretmanager.admin" \
    --quiet

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/firebase.admin" \
    --quiet

print_success "Permissions granted"

KEY_FILE="$HOME/gcp-key-learning-english.json"
print_info "Creating service account key..."
gcloud iam service-accounts keys create $KEY_FILE \
    --iam-account=$SA_EMAIL
print_success "Service account key created: $KEY_FILE"

echo ""
echo "=================================================="
echo "  Step 3: Generate Secrets"
echo "=================================================="
echo ""

AUTH_SECRET=$(openssl rand -base64 32)
print_success "Generated AUTH_SECRET: $AUTH_SECRET"

echo ""
echo "=================================================="
echo "  Step 4: Vercel Configuration"
echo "=================================================="
echo ""

print_info "Please log in to Vercel..."
vercel login

echo ""
print_info "Fetching Vercel organization ID..."
vercel teams list
echo ""
read -p "Enter your Vercel Organization ID (team_...): " VERCEL_ORG_ID

echo ""
print_info "Fetching Vercel project list..."
vercel projects list
echo ""
read -p "Enter your Vercel Project ID (prj_...): " VERCEL_PROJECT_ID

echo ""
read -p "Enter your Vercel API Token: " VERCEL_TOKEN

echo ""
echo "=================================================="
echo "  Step 5: Firebase Configuration"
echo "=================================================="
echo ""

print_info "Please obtain these values from Firebase Console"
print_info "(https://console.firebase.google.com/)"
print_info "Project Settings → Your apps → Web app config"
echo ""

read -p "Firebase Project ID: " FIREBASE_PROJECT_ID
read -p "Firebase API Key: " FIREBASE_API_KEY
read -p "Firebase Auth Domain: " FIREBASE_AUTH_DOMAIN
read -p "Firebase Storage Bucket: " FIREBASE_STORAGE_BUCKET
read -p "Firebase Messaging Sender ID: " FIREBASE_MESSAGING_SENDER_ID
read -p "Firebase App ID: " FIREBASE_APP_ID
read -p "Firebase Measurement ID (optional): " FIREBASE_MEASUREMENT_ID

echo ""
echo "=================================================="
echo "  Step 6: Google OAuth Configuration"
echo "=================================================="
echo ""

print_info "Please obtain these values from Google Cloud Console"
print_info "(https://console.cloud.google.com/apis/credentials)"
echo ""

read -p "Google OAuth Client ID: " AUTH_GOOGLE_ID
read -p "Google OAuth Client Secret: " AUTH_GOOGLE_SECRET

echo ""
echo "=================================================="
echo "  Step 7: Creating Configuration Files"
echo "=================================================="
echo ""

# Create terraform.tfvars
TFVARS_FILE="terraform/terraform.tfvars"
print_info "Creating $TFVARS_FILE..."

cat > $TFVARS_FILE << EOF
# Google Cloud Configuration
gcp_project_id = "$GCP_PROJECT_ID"
gcp_region     = "us-central1"

# GitHub Configuration
github_repo = "lnwu/learning-english"

# Vercel Configuration
vercel_token       = "$VERCEL_TOKEN"
vercel_org_id      = "$VERCEL_ORG_ID"
vercel_project_id  = "$VERCEL_PROJECT_ID"
vercel_project_name = "learning-english"

# NextAuth Configuration
auth_secret        = "$AUTH_SECRET"
auth_google_id     = "$AUTH_GOOGLE_ID"
auth_google_secret = "$AUTH_GOOGLE_SECRET"

# Firebase Configuration
firebase_project_id          = "$FIREBASE_PROJECT_ID"
firebase_api_key             = "$FIREBASE_API_KEY"
firebase_auth_domain         = "$FIREBASE_AUTH_DOMAIN"
firebase_storage_bucket      = "$FIREBASE_STORAGE_BUCKET"
firebase_messaging_sender_id = "$FIREBASE_MESSAGING_SENDER_ID"
firebase_app_id              = "$FIREBASE_APP_ID"
firebase_measurement_id      = "$FIREBASE_MEASUREMENT_ID"
EOF

print_success "Created $TFVARS_FILE"

echo ""
echo "=================================================="
echo "  Step 8: Setting GitHub Secrets"
echo "=================================================="
echo ""

print_info "Setting GitHub repository secrets..."

gh secret set GCP_PROJECT_ID --body "$GCP_PROJECT_ID"
gh secret set GCP_SERVICE_ACCOUNT_KEY < $KEY_FILE
gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN"
gh secret set VERCEL_ORG_ID --body "$VERCEL_ORG_ID"
gh secret set VERCEL_PROJECT_ID --body "$VERCEL_PROJECT_ID"
gh secret set AUTH_SECRET --body "$AUTH_SECRET"
gh secret set AUTH_GOOGLE_ID --body "$AUTH_GOOGLE_ID"
gh secret set AUTH_GOOGLE_SECRET --body "$AUTH_GOOGLE_SECRET"
gh secret set FIREBASE_PROJECT_ID --body "$FIREBASE_PROJECT_ID"
gh secret set FIREBASE_API_KEY --body "$FIREBASE_API_KEY"
gh secret set FIREBASE_AUTH_DOMAIN --body "$FIREBASE_AUTH_DOMAIN"
gh secret set FIREBASE_STORAGE_BUCKET --body "$FIREBASE_STORAGE_BUCKET"
gh secret set FIREBASE_MESSAGING_SENDER_ID --body "$FIREBASE_MESSAGING_SENDER_ID"
gh secret set FIREBASE_APP_ID --body "$FIREBASE_APP_ID"
gh secret set FIREBASE_MEASUREMENT_ID --body "$FIREBASE_MEASUREMENT_ID"

print_success "GitHub secrets configured"

echo ""
echo "=================================================="
echo "  Step 9: Initialize Terraform"
echo "=================================================="
echo ""

cd terraform
print_info "Initializing Terraform..."
terraform init
print_success "Terraform initialized"

echo ""
print_info "Validating Terraform configuration..."
terraform validate
print_success "Terraform configuration is valid"

echo ""
echo "=================================================="
echo "  ✅ Setup Complete!"
echo "=================================================="
echo ""
print_success "All configuration complete!"
echo ""
echo "Next steps:"
echo ""
echo "1. Review Terraform plan:"
echo "   cd terraform && terraform plan"
echo ""
echo "2. Apply Terraform configuration:"
echo "   cd terraform && terraform apply"
echo ""
echo "3. Commit and push changes to trigger deployment:"
echo "   git add ."
echo "   git commit -m 'feat: Add infrastructure as code'"
echo "   git push origin master"
echo ""
echo "4. Monitor deployment in GitHub Actions:"
echo "   https://github.com/lnwu/learning-english/actions"
echo ""
echo "Important files created:"
echo "  - terraform/terraform.tfvars (DO NOT COMMIT)"
echo "  - $KEY_FILE (DO NOT COMMIT)"
echo ""
print_warning "Remember to keep these files secure and never commit them to git!"
echo ""
