# Infrastructure Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Developer Workflow                          │
│                                                                     │
│  1. Make changes to code                                            │
│  2. Commit and push to GitHub                                       │
│  3. Create Pull Request → Terraform Plan runs                       │
│  4. Merge to master → Automated deployment                          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         GitHub Repository                           │
│                     github.com/lnwu/learning-english                │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │  Source Code     │  │  Terraform IaC   │  │  GitHub Actions │  │
│  │  - Next.js app   │  │  - main.tf       │  │  - deploy.yml   │  │
│  │  - TypeScript    │  │  - modules/      │  │  - CI/CD        │  │
│  │  - Components    │  │  - variables.tf  │  │                 │  │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ Push to master triggers
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      GitHub Actions Workflow                        │
│                                                                     │
│  Step 1: Build & Test                                               │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ ✓ Install dependencies (npm ci)                            │    │
│  │ ✓ Lint code (npm run lint)                                 │    │
│  │ ✓ Build application (npm run build)                        │    │
│  └────────────────────────────────────────────────────────────┘    │
│                             │                                       │
│                             ▼                                       │
│  Step 2: Terraform Apply                                            │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ ✓ Authenticate to GCP (service account)                    │    │
│  │ ✓ Initialize Terraform                                     │    │
│  │ ✓ Apply infrastructure changes                             │    │
│  │ ✓ Update Secret Manager                                    │    │
│  │ ✓ Configure Vercel env vars                                │    │
│  └────────────────────────────────────────────────────────────┘    │
│                             │                                       │
│                             ▼                                       │
│  Step 3: Deploy to Vercel                                           │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ ✓ Pull Vercel environment                                  │    │
│  │ ✓ Build production artifacts                               │    │
│  │ ✓ Deploy to production                                     │    │
│  └────────────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
┌─────────────────────────────┐  ┌──────────────────────────┐
│   Google Cloud Platform     │  │   Vercel Platform        │
│                             │  │                          │
│  ┌────────────────────────┐ │  │  ┌────────────────────┐ │
│  │  Secret Manager        │ │  │  │  Production        │ │
│  │  ───────────────────── │ │  │  │  Deployment        │ │
│  │  • AUTH_SECRET        │ │  │  │  ────────────────  │ │
│  │  • AUTH_GOOGLE_ID     │ │  │  │  • Next.js app     │ │
│  │  • AUTH_GOOGLE_SECRET │ │  │  │  • Edge Functions  │ │
│  │  • FIREBASE_* (7)     │ │  │  │  • Static Assets   │ │
│  │  • Encrypted at rest  │ │  │  │  • CDN             │ │
│  │  • Version control    │ │  │  │  • Auto-scaling    │ │
│  └────────────────────────┘ │  │  └────────────────────┘ │
│                             │  │                          │
│  ┌────────────────────────┐ │  │  ┌────────────────────┐ │
│  │  Firebase              │ │  │  │  Environment Vars  │ │
│  │  ───────────────────── │ │  │  │  ────────────────  │ │
│  │  • Authentication      │ │  │  │  • Synced from     │ │
│  │  • Firestore Database  │ │  │  │    Secret Manager  │ │
│  │  • Cloud Storage       │ │  │  │  • Production +    │ │
│  │  • Real-time sync      │ │  │  │    Preview envs    │ │
│  └────────────────────────┘ │  │  └────────────────────┘ │
│                             │  │                          │
│  ┌────────────────────────┐ │  │  ┌────────────────────┐ │
│  │  IAM & Permissions     │ │  │  │  Custom Domain     │ │
│  │  ───────────────────── │ │  │  │  ────────────────  │ │
│  │  • Service Accounts    │ │  │  │  • Auto SSL        │ │
│  │  • Role Bindings       │ │  │  │  • DNS             │ │
│  │  • Least Privilege     │ │  │  │  • CDN Edge        │ │
│  └────────────────────────┘ │  │  └────────────────────┘ │
└─────────────────────────────┘  └──────────────────────────┘
                │                            │
                │                            │
                └──────────┬─────────────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │   End Users          │
                │   ───────────────    │
                │   • Visit website    │
                │   • Sign in (OAuth)  │
                │   • Use application  │
                │   • Data synced      │
                └──────────────────────┘
```

## Data Flow

### 1. Secret Management Flow

```
GitHub Secrets (encrypted)
    │
    ├─→ GCP_SERVICE_ACCOUNT_KEY ──→ GitHub Actions
    │                                      │
    │                                      ▼
    ├─→ All other secrets ────────→ Terraform Variables
    │                                      │
    │                                      ▼
    └───────────────────────────→ Google Cloud Secret Manager
                                           │
                                           ▼
                                    Vercel Environment Variables
                                           │
                                           ▼
                                    Next.js Application Runtime
```

### 2. Deployment Flow

```
Code Commit
    │
    ▼
GitHub Push to master
    │
    ├─→ Trigger GitHub Actions
    │       │
    │       ├─→ Checkout code
    │       ├─→ Install dependencies
    │       ├─→ Run linter
    │       ├─→ Build application
    │       │
    │       ├─→ Authenticate to GCP
    │       ├─→ Terraform init
    │       └─→ Terraform apply
    │               │
    │               ├─→ Update Secret Manager
    │               └─→ Configure Vercel env vars
    │
    └─→ Deploy to Vercel
            │
            ├─→ Build production bundle
            ├─→ Deploy to edge network
            └─→ Activate deployment
                    │
                    ▼
            Application Live! 🚀
```

### 3. Authentication Flow

```
User visits app
    │
    ▼
Next.js redirects to login
    │
    ▼
User clicks "Sign in with Google"
    │
    ├─→ Uses AUTH_GOOGLE_ID (from Secret Manager)
    ├─→ Uses AUTH_GOOGLE_SECRET (from Secret Manager)
    │
    ▼
Google OAuth consent screen
    │
    ▼
User grants permission
    │
    ▼
Redirect back to app with token
    │
    ├─→ NextAuth validates with AUTH_SECRET
    │
    ▼
Session created
    │
    ▼
User authenticated ✓
    │
    ├─→ Firebase auth (FIREBASE_* vars)
    ├─→ Firestore access
    └─→ App functionality enabled
```

## Security Layers

```
┌────────────────────────────────────────────────────────┐
│                    Security Layers                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Layer 1: GitHub Secrets (encrypted by GitHub)        │
│  └─→ Only accessible to GitHub Actions                │
│                                                        │
│  Layer 2: GCP Service Account (JSON key)              │
│  └─→ Minimal permissions (least privilege)            │
│                                                        │
│  Layer 3: Google Cloud Secret Manager                 │
│  ├─→ Encrypted at rest                                │
│  ├─→ Access audit logs                                │
│  ├─→ Version control                                  │
│  └─→ IAM-based access                                 │
│                                                        │
│  Layer 4: Vercel Environment Variables                │
│  ├─→ Separate production/preview                      │
│  ├─→ Managed by Terraform                             │
│  └─→ Auto-injected at build time                      │
│                                                        │
│  Layer 5: Application Runtime                         │
│  ├─→ Server-side only secrets (not in bundle)         │
│  ├─→ Public vars (NEXT_PUBLIC_*) in client            │
│  └─→ Secure session management                        │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Terraform Module Structure

```
terraform/
├── main.tf                     # Root configuration
│   ├── Provider configs        # Google Cloud, Vercel
│   ├── Enable GCP APIs         # Secret Manager, Firebase, etc.
│   ├── module "secret_manager" # Secret management
│   ├── module "vercel"         # Vercel deployment
│   └── Service Account + IAM   # GitHub Actions access
│
├── variables.tf                # Input variables (15 total)
│   ├── GCP configs
│   ├── Vercel configs
│   ├── Auth configs
│   └── Firebase configs
│
├── outputs.tf                  # Output values
│   ├── Service account email
│   ├── Secret names
│   ├── Vercel URL
│   └── Next steps message
│
├── terraform.tfvars.example    # Example configuration
│   └── All variables with placeholders
│
└── modules/
    ├── secret-manager/
    │   └── main.tf             # Creates secrets in GCP
    │       ├── google_secret_manager_secret
    │       └── google_secret_manager_secret_version
    │
    └── vercel/
        └── main.tf             # Configures Vercel
            ├── Data source (existing project)
            └── vercel_project_environment_variable
```

## Cost Breakdown

```
┌──────────────────────────────────────────────────────┐
│              Monthly Cost Estimate                   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Google Cloud                                        │
│  ├─ Secret Manager                                   │
│  │  └─ 10 secrets × $0.06 = $0.60/month             │
│  ├─ Firebase (Free Tier)                             │
│  │  ├─ Auth: 10k MAU free                            │
│  │  ├─ Firestore: 1GB free                           │
│  │  └─ Storage: 5GB free                             │
│  └─ Cloud Build: $0 (GitHub Actions handles it)     │
│                                                      │
│  Vercel                                              │
│  ├─ Hobby: $0/month (with limits)                   │
│  └─ Pro: $20/month (unlimited)                       │
│                                                      │
│  GitHub Actions                                      │
│  ├─ Public repos: Free                               │
│  └─ Private repos: 2000 min/month free               │
│                                                      │
│  TOTAL: $0.60 - $20.60/month                         │
│  (Free tier: ~$1/month)                              │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Monitoring & Observability

```
┌────────────────────────────────────────┐
│       Monitoring Points                │
├────────────────────────────────────────┤
│                                        │
│  GitHub Actions                        │
│  ├─ Workflow runs                      │
│  ├─ Build logs                         │
│  └─ Deployment status                  │
│                                        │
│  Google Cloud                          │
│  ├─ Secret Manager audit logs          │
│  ├─ IAM access logs                    │
│  ├─ Firebase analytics                 │
│  └─ Firestore usage                    │
│                                        │
│  Vercel                                │
│  ├─ Deployment logs                    │
│  ├─ Function logs                      │
│  ├─ Analytics                          │
│  └─ Performance metrics                │
│                                        │
│  Application                           │
│  ├─ Vercel Analytics                   │
│  ├─ Error tracking (optional)          │
│  └─ User metrics                       │
│                                        │
└────────────────────────────────────────┘
```

## Disaster Recovery

```
Backup Strategy:
├─ Terraform State
│  └─ Stored in GCS bucket (optional)
│
├─ Secrets
│  ├─ GitHub Secrets (encrypted by GitHub)
│  └─ Secret Manager (versioned)
│
├─ Source Code
│  └─ GitHub repository (with history)
│
├─ Firebase Data
│  ├─ Firestore: Daily backups (manual setup)
│  └─ Storage: Versioning enabled
│
└─ Vercel Deployments
   └─ Git-based (can redeploy from any commit)

Recovery Time Objective (RTO): < 1 hour
Recovery Point Objective (RPO): < 24 hours
```

## Summary

This infrastructure provides:
- ✅ **Automated deployment** from git push
- ✅ **Secure secret management** with encryption
- ✅ **Scalable architecture** with Vercel edge
- ✅ **Cost-effective** (free tier for most use cases)
- ✅ **Version controlled** infrastructure
- ✅ **Easy to maintain** and update
- ✅ **Production-ready** with monitoring
