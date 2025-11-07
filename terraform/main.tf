# Main Terraform configuration for Learning English Application
# This sets up Google Cloud, Firebase, and Vercel infrastructure
# ALL SECRETS AUTOMATICALLY GENERATED AND CONFIGURED - NO MANUAL STEPS!

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }

  # Backend configuration for state management
  # For production, uncomment and configure remote state storage in GCS:
  # 
  # backend "gcs" {
  #   bucket = "your-terraform-state-bucket"
  #   prefix = "terraform/state"
  # }
  # 
  # To set up the backend:
  # 1. Create a GCS bucket: gsutil mb gs://your-terraform-state-bucket
  # 2. Enable versioning: gsutil versioning set on gs://your-terraform-state-bucket
  # 3. Uncomment the backend config above
  # 4. Run: terraform init -migrate-state
  #
  # WARNING: Local state files contain sensitive information and are not
  # suitable for production use or team collaboration.
}

# Google Cloud Provider
provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# Google Beta Provider (for Firebase resources)
provider "google-beta" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# Vercel Provider
provider "vercel" {
  api_token = var.vercel_token
  team      = var.vercel_org_id
}

# Get project number for Identity Platform
data "google_project" "project" {
  project_id = var.gcp_project_id
}

# Enable required Google Cloud APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "secretmanager.googleapis.com",
    "firebase.googleapis.com",
    "firestore.googleapis.com",
    "identitytoolkit.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "iam.googleapis.com",
    "cloudkms.googleapis.com",
    "firebaserules.googleapis.com",
    "firebasestorage.googleapis.com",
    "iap.googleapis.com",
  ])

  service            = each.key
  disable_on_destroy = false
}

# Generate random AUTH_SECRET for NextAuth
resource "random_password" "auth_secret" {
  length  = 32
  special = true
}

# Create KMS Key Ring for SOPS encryption
resource "google_kms_key_ring" "sops" {
  name     = "sops"
  location = "global"
  
  depends_on = [google_project_service.required_apis]
}

# Create KMS Crypto Key for SOPS
resource "google_kms_crypto_key" "sops" {
  name     = "sops-key"
  key_ring = google_kms_key_ring.sops.id
  purpose  = "ENCRYPT_DECRYPT"

  lifecycle {
    prevent_destroy = true
  }
}

# Google Cloud Secret Manager module
# Now only stores provider credentials, not application secrets
module "secret_manager" {
  source = "./modules/secret-manager"

  project_id = var.gcp_project_id
  secrets = {
    # Only provider credentials in Secret Manager
    # Application secrets are encrypted with SOPS in the repository
  }

  depends_on = [google_project_service.required_apis]
}

# Firebase Module - Creates complete Firebase infrastructure
module "firebase" {
  source = "./modules/firebase"

  project_id            = var.gcp_project_id
  region                = var.gcp_region
  firestore_rules_file  = "${path.root}/../firestore.rules"
  storage_rules_file    = "${path.root}/../storage.rules"

  depends_on = [google_project_service.required_apis]
}

# Identity Platform Module - Creates OAuth 2.0 client automatically
module "identity_platform" {
  source = "./modules/identity-platform"

  project_id         = var.gcp_project_id
  project_number     = data.google_project.project.number
  app_name           = "Learning English"
  production_domain  = var.vercel_production_domain

  depends_on = [google_project_service.required_apis]
}

# Vercel Project Configuration with AUTO-GENERATED environment variables
module "vercel_deployment" {
  source = "./modules/vercel"

  project_name = var.vercel_project_name
  org_id       = var.vercel_org_id
  project_id   = var.vercel_project_id
  
  # Git repository configuration
  git_repository = {
    type              = "github"
    repo              = var.github_repo
    production_branch = "master"
  }

  # Environment variables AUTOMATICALLY populated from Terraform outputs
  # NO MANUAL SECRETS NEEDED!
  environment_variables = {
    # NextAuth Configuration (AUTO-GENERATED)
    AUTH_SECRET = {
      value     = random_password.auth_secret.result
      target    = ["production", "preview", "development"]
      sensitive = true
    }
    AUTH_GOOGLE_ID = {
      value     = module.identity_platform.oauth_client_id
      target    = ["production", "preview", "development"]
      sensitive = false
    }
    AUTH_GOOGLE_SECRET = {
      value     = module.identity_platform.oauth_client_secret
      target    = ["production", "preview", "development"]
      sensitive = true
    }
    
    # Firebase Configuration (AUTO-GENERATED from Firebase module)
    NEXT_PUBLIC_FIREBASE_API_KEY = {
      value     = module.firebase.firebase_config.api_key
      target    = ["production", "preview", "development"]
      sensitive = false
    }
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = {
      value     = module.firebase.firebase_config.auth_domain
      target    = ["production", "preview", "development"]
      sensitive = false
    }
    NEXT_PUBLIC_FIREBASE_PROJECT_ID = {
      value     = module.firebase.firebase_config.project_id
      target    = ["production", "preview", "development"]
      sensitive = false
    }
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = {
      value     = module.firebase.firebase_config.storage_bucket
      target    = ["production", "preview", "development"]
      sensitive = false
    }
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = {
      value     = module.firebase.firebase_config.messaging_sender_id
      target    = ["production", "preview", "development"]
      sensitive = false
    }
    NEXT_PUBLIC_FIREBASE_APP_ID = {
      value     = module.firebase.firebase_config.app_id
      target    = ["production", "preview", "development"]
      sensitive = false
    }
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = {
      value     = module.firebase.firebase_config.measurement_id
      target    = ["production", "preview", "development"]
      sensitive = false
    }
  }

  depends_on = [
    module.secret_manager,
    module.firebase,
    module.identity_platform
  ]
}

# Service Account for GitHub Actions
resource "google_service_account" "github_actions" {
  account_id   = "github-actions-deploy"
  display_name = "GitHub Actions Deployment Service Account"
  description  = "Service account for GitHub Actions to deploy and decrypt secrets"
}

# Grant KMS decrypter role for SOPS
resource "google_kms_crypto_key_iam_member" "github_actions_decrypter" {
  crypto_key_id = google_kms_crypto_key.sops.id
  role          = "roles/cloudkms.cryptoKeyDecrypter"
  member        = "serviceAccount:${google_service_account.github_actions.email}"
}

# Grant necessary Firebase permissions
resource "google_project_iam_member" "github_actions_firebase_admin" {
  project = var.gcp_project_id
  role    = "roles/firebase.admin"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}
