# Main Terraform configuration for Learning English Application
# This sets up Google Cloud, Firebase, and Vercel infrastructure

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.0"
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

# Vercel Provider
provider "vercel" {
  api_token = var.vercel_token
  team      = var.vercel_org_id
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
  ])

  service            = each.key
  disable_on_destroy = false
}

# Google Cloud Secret Manager module
module "secret_manager" {
  source = "./modules/secret-manager"

  project_id = var.gcp_project_id
  secrets = {
    auth_secret = {
      value       = var.auth_secret
      description = "NextAuth secret for session encryption"
    }
    auth_google_id = {
      value       = var.auth_google_id
      description = "Google OAuth Client ID"
    }
    auth_google_secret = {
      value       = var.auth_google_secret
      description = "Google OAuth Client Secret"
    }
    firebase_api_key = {
      value       = var.firebase_api_key
      description = "Firebase API Key"
    }
    firebase_auth_domain = {
      value       = var.firebase_auth_domain
      description = "Firebase Auth Domain"
    }
    firebase_project_id = {
      value       = var.firebase_project_id
      description = "Firebase Project ID"
    }
    firebase_storage_bucket = {
      value       = var.firebase_storage_bucket
      description = "Firebase Storage Bucket"
    }
    firebase_messaging_sender_id = {
      value       = var.firebase_messaging_sender_id
      description = "Firebase Messaging Sender ID"
    }
    firebase_app_id = {
      value       = var.firebase_app_id
      description = "Firebase App ID"
    }
    firebase_measurement_id = {
      value       = var.firebase_measurement_id
      description = "Firebase Measurement ID"
    }
  }

  depends_on = [google_project_service.required_apis]
}

# Vercel Project Configuration
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

  # Environment variables from Google Secret Manager
  environment_variables = {
    AUTH_SECRET = {
      value     = var.auth_secret
      target    = ["production", "preview"]
      sensitive = true
    }
    AUTH_GOOGLE_ID = {
      value     = var.auth_google_id
      target    = ["production", "preview"]
      sensitive = true
    }
    AUTH_GOOGLE_SECRET = {
      value     = var.auth_google_secret
      target    = ["production", "preview"]
      sensitive = true
    }
    NEXT_PUBLIC_FIREBASE_API_KEY = {
      value     = var.firebase_api_key
      target    = ["production", "preview"]
      sensitive = false
    }
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = {
      value     = var.firebase_auth_domain
      target    = ["production", "preview"]
      sensitive = false
    }
    NEXT_PUBLIC_FIREBASE_PROJECT_ID = {
      value     = var.firebase_project_id
      target    = ["production", "preview"]
      sensitive = false
    }
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = {
      value     = var.firebase_storage_bucket
      target    = ["production", "preview"]
      sensitive = false
    }
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = {
      value     = var.firebase_messaging_sender_id
      target    = ["production", "preview"]
      sensitive = false
    }
    NEXT_PUBLIC_FIREBASE_APP_ID = {
      value     = var.firebase_app_id
      target    = ["production", "preview"]
      sensitive = false
    }
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = {
      value     = var.firebase_measurement_id
      target    = ["production", "preview"]
      sensitive = false
    }
  }

  depends_on = [module.secret_manager]
}

# Service Account for GitHub Actions
resource "google_service_account" "github_actions" {
  account_id   = "github-actions-deploy"
  display_name = "GitHub Actions Deployment Service Account"
  description  = "Service account for GitHub Actions to access secrets during deployment"
}

# Grant Secret Manager access to GitHub Actions service account
resource "google_project_iam_member" "github_actions_secret_accessor" {
  project = var.gcp_project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# Grant necessary Firebase permissions
resource "google_project_iam_member" "github_actions_firebase_admin" {
  project = var.gcp_project_id
  role    = "roles/firebase.admin"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}
