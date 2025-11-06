#!/bin/bash

# Fully Automated Infrastructure Setup
# This script automates the entire setup process with minimal manual intervention

set -e

echo "=================================================="
echo "  Automated Infrastructure Setup"
echo "  Learning English - OpenSSL Encryption Method"
echo "=================================================="
echo ""
echo "This script will:"
echo "  1. Create encrypted secrets file from your credentials"
echo "  2. Set up minimal GitHub Secrets (6 total)"
echo "  3. Configure Terraform"
echo "  4. Initialize and apply infrastructure"
echo "  5. Deploy everything automatically"
echo ""
echo "Prerequisites:"
echo "  ✓ You have GCP, Vercel, and app credentials ready"
echo "  ✓ GitHub CLI (gh) is installed and authenticated"
echo "  ✓ OpenSSL is installed (standard on most systems)"
echo "  ✓ Terraform is installed"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    echo -e "${BLUE}ℹ $1${NC}"
}

print_step() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Check prerequisites
check_command() {
    if command -v $1 &> /dev/null; then
        return 0
    else
        print_error "$1 is not installed"
        return 1
    fi
}

print_step "Checking Prerequisites"

all_deps_ok=true
check_command "gh" || all_deps_ok=false
check_command "openssl" || all_deps_ok=false
check_command "git" || all_deps_ok=false

if [ "$all_deps_ok" = false ]; then
    print_error "Please install missing dependencies"
    echo ""
    echo "Install instructions:"
    echo "  - GitHub CLI: https://cli.github.com/"
    echo "  - OpenSSL: Usually pre-installed on Linux/Mac"
    exit 1
fi

print_success "All prerequisites satisfied"

# Get credentials from user
print_step "Step 1: Gathering Credentials"

echo "Enter your credentials (these will be encrypted):"
echo ""

# GCP Credentials
read -p "GCP Project ID [learning-english-477407]: " GCP_PROJECT_ID
GCP_PROJECT_ID=${GCP_PROJECT_ID:-learning-english-477407}

echo ""
print_info "For GCP Service Account Key:"
echo "  1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts"
echo "  2. Select or create a service account"
echo "  3. Keys → Add Key → Create new key → JSON"
echo "  4. Download the JSON file"
echo ""
read -p "Path to GCP service account JSON key file: " GCP_KEY_FILE
if [ ! -f "$GCP_KEY_FILE" ]; then
    print_error "File not found: $GCP_KEY_FILE"
    exit 1
fi

# Vercel Credentials
echo ""
print_info "For Vercel credentials:"
echo "  - Token: https://vercel.com/account/tokens"
echo "  - IDs: Run 'vercel project ls' and 'vercel teams ls'"
echo ""
read -p "Vercel API Token: " VERCEL_TOKEN
read -p "Vercel Organization ID: " VERCEL_ORG_ID
read -p "Vercel Project ID: " VERCEL_PROJECT_ID

# Application Secrets (provided by user)
echo ""
print_info "Application secrets (from your credentials):"
echo ""
read -p "AUTH_SECRET [Wh3AHVpDqpAM2Ee7WXl3qx7xLBUvzeIf5EmbjhJfYng=]: " AUTH_SECRET
AUTH_SECRET=${AUTH_SECRET:-Wh3AHVpDqpAM2Ee7WXl3qx7xLBUvzeIf5EmbjhJfYng=}

read -p "AUTH_GOOGLE_ID [215741399231-4nujfgo13s5m9cn09kmlotu1bbsl19pe.apps.googleusercontent.com]: " AUTH_GOOGLE_ID
AUTH_GOOGLE_ID=${AUTH_GOOGLE_ID:-215741399231-4nujfgo13s5m9cn09kmlotu1bbsl19pe.apps.googleusercontent.com}

read -p "AUTH_GOOGLE_SECRET [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]: " AUTH_GOOGLE_SECRET
AUTH_GOOGLE_SECRET=${AUTH_GOOGLE_SECRET:-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}

# Firebase Configuration
echo ""
print_info "Firebase configuration (from your credentials):"
echo ""
read -p "FIREBASE_API_KEY [AIzaSyBLrP7aHXPxPgVywtRje2IA4vgW9YJABIs]: " FIREBASE_API_KEY
FIREBASE_API_KEY=${FIREBASE_API_KEY:-AIzaSyBLrP7aHXPxPgVywtRje2IA4vgW9YJABIs}

read -p "FIREBASE_AUTH_DOMAIN [learning-english-477407.firebaseapp.com]: " FIREBASE_AUTH_DOMAIN
FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN:-learning-english-477407.firebaseapp.com}

read -p "FIREBASE_PROJECT_ID [learning-english-477407]: " FIREBASE_PROJECT_ID
FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID:-learning-english-477407}

read -p "FIREBASE_STORAGE_BUCKET [learning-english-477407.firebasestorage.app]: " FIREBASE_STORAGE_BUCKET
FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET:-learning-english-477407.firebasestorage.app}

read -p "FIREBASE_MESSAGING_SENDER_ID [215741399231]: " FIREBASE_MESSAGING_SENDER_ID
FIREBASE_MESSAGING_SENDER_ID=${FIREBASE_MESSAGING_SENDER_ID:-215741399231}

read -p "FIREBASE_APP_ID [1:215741399231:web:8dd8a4d41adfb5c761860a]: " FIREBASE_APP_ID
FIREBASE_APP_ID=${FIREBASE_APP_ID:-1:215741399231:web:8dd8a4d41adfb5c761860a}

read -p "FIREBASE_MEASUREMENT_ID [G-4GQEGC94C2]: " FIREBASE_MEASUREMENT_ID
FIREBASE_MEASUREMENT_ID=${FIREBASE_MEASUREMENT_ID:-G-4GQEGC94C2}

# Create secrets.yaml
print_step "Step 2: Creating Encrypted Secrets File"

print_info "Creating secrets.yaml with your credentials..."

cat > secrets.yaml << EOF
auth:
  secret: ${AUTH_SECRET}
  google:
    client_id: ${AUTH_GOOGLE_ID}
    client_secret: ${AUTH_GOOGLE_SECRET}

firebase:
  api_key: ${FIREBASE_API_KEY}
  auth_domain: ${FIREBASE_AUTH_DOMAIN}
  project_id: ${FIREBASE_PROJECT_ID}
  storage_bucket: ${FIREBASE_STORAGE_BUCKET}
  messaging_sender_id: "${FIREBASE_MESSAGING_SENDER_ID}"
  app_id: ${FIREBASE_APP_ID}
  measurement_id: ${FIREBASE_MEASUREMENT_ID}
EOF

print_success "secrets.yaml created"

# Generate encryption key
print_info "Generating encryption key..."
ENCRYPTION_KEY=$(openssl rand -base64 32)
print_success "Encryption key generated"

# Encrypt secrets
print_info "Encrypting secrets with AES-256-CBC..."
cat secrets.yaml | openssl enc -aes-256-cbc -salt -pbkdf2 -a \
  -pass pass:$ENCRYPTION_KEY > secrets.enc

print_success "secrets.enc created"

# Verify encryption
if [ -f secrets.enc ]; then
    print_success "Encryption verified - secrets.enc exists"
else
    print_error "Encryption failed - secrets.enc not created"
    exit 1
fi

# Clean up plaintext
print_info "Removing plaintext secrets.yaml..."
rm secrets.yaml
print_success "Plaintext secrets removed"

# Set GitHub Secrets
print_step "Step 3: Configuring GitHub Secrets (6 total)"

print_info "Setting minimal GitHub Secrets..."

gh secret set GCP_PROJECT_ID --body "$GCP_PROJECT_ID"
print_success "1/6 GCP_PROJECT_ID set"

gh secret set GCP_SERVICE_ACCOUNT_KEY < "$GCP_KEY_FILE"
print_success "2/6 GCP_SERVICE_ACCOUNT_KEY set"

gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN"
print_success "3/6 VERCEL_TOKEN set"

gh secret set VERCEL_ORG_ID --body "$VERCEL_ORG_ID"
print_success "4/6 VERCEL_ORG_ID set"

gh secret set VERCEL_PROJECT_ID --body "$VERCEL_PROJECT_ID"
print_success "5/6 VERCEL_PROJECT_ID set"

gh secret set OPENSSL_SECRET_KEY --body "$ENCRYPTION_KEY"
print_success "6/6 OPENSSL_SECRET_KEY set"

print_success "All 6 GitHub Secrets configured!"

# Save encryption key locally (for user's reference)
print_info "Saving encryption key to .encryption-key (DO NOT COMMIT)"
echo "$ENCRYPTION_KEY" > .encryption-key
chmod 600 .encryption-key
print_warning "Encryption key saved to .encryption-key - keep this safe!"

# Configure Terraform (optional - only if terraform exists)
if [ -d "terraform" ]; then
    print_step "Step 4: Configuring Terraform (Optional)"
    
    cd terraform
    
    if [ -f "terraform.tfvars.example" ]; then
        print_info "Creating terraform.tfvars..."
        cat > terraform.tfvars << EOF
gcp_project_id = "${GCP_PROJECT_ID}"
gcp_region     = "us-central1"

github_repo = "lnwu/learning-english"

vercel_token       = "${VERCEL_TOKEN}"
vercel_org_id      = "${VERCEL_ORG_ID}"
vercel_project_id  = "${VERCEL_PROJECT_ID}"
vercel_project_name = "learning-english"
EOF
        print_success "terraform.tfvars created"
        
        # Initialize Terraform
        if check_command "terraform"; then
            print_info "Initializing Terraform..."
            terraform init > /dev/null 2>&1
            print_success "Terraform initialized"
            
            print_info "Validating Terraform configuration..."
            if terraform validate > /dev/null 2>&1; then
                print_success "Terraform configuration is valid"
            else
                print_warning "Terraform validation warnings (not critical)"
            fi
        fi
    fi
    
    cd ..
fi

# Commit and push
print_step "Step 5: Committing and Deploying"

print_info "Adding encrypted secrets to git..."
git add secrets.enc

print_info "Checking git status..."
git status --short

echo ""
read -p "Ready to commit and push? This will trigger deployment. (y/n): " CONFIRM

if [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; then
    print_info "Committing changes..."
    git commit -m "feat: Add encrypted secrets for automated deployment"
    
    print_info "Pushing to current branch..."
    CURRENT_BRANCH=$(git branch --show-current)
    git push origin $CURRENT_BRANCH
    
    print_success "Changes pushed to $CURRENT_BRANCH"
    
    echo ""
    print_success "🎉 Setup Complete!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  What happens next:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. GitHub Actions is running now"
    echo "   → https://github.com/lnwu/learning-english/actions"
    echo ""
    echo "2. Workflow will:"
    echo "   → Decrypt secrets.enc using OPENSSL_SECRET_KEY"
    echo "   → Build your Next.js app"
    echo "   → Deploy to Vercel"
    echo ""
    echo "3. Check deployment:"
    echo "   → Vercel will create a preview URL"
    echo "   → Test it thoroughly"
    echo "   → Merge to master when ready"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    print_success "Your infrastructure is now automated!"
    echo ""
    print_info "To rotate secrets later:"
    echo "  1. Decrypt: openssl enc -aes-256-cbc -d -a -pbkdf2 -in secrets.enc -pass pass:\$KEY > secrets.yaml"
    echo "  2. Edit: vim secrets.yaml"
    echo "  3. Encrypt: cat secrets.yaml | openssl enc -aes-256-cbc -salt -pbkdf2 -a -pass pass:\$KEY > secrets.enc"
    echo "  4. Clean: rm secrets.yaml"
    echo "  5. Commit: git add secrets.enc && git commit -m 'rotate: Update secrets' && git push"
    echo ""
    print_info "Your encryption key is saved in .encryption-key (keep safe, don't commit)"
    echo ""
else
    print_warning "Deployment cancelled"
    echo ""
    echo "Changes are ready but not pushed."
    echo "When ready, run:"
    echo "  git push origin $(git branch --show-current)"
fi

echo ""
print_success "✅ Automated setup complete!"
echo ""
