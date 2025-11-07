# Firebase module
# Creates and configures complete Firebase infrastructure

variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
}

variable "region" {
  description = "Region for Firebase resources"
  type        = string
  default     = "us-central1"
}

variable "firestore_rules_file" {
  description = "Path to Firestore security rules file"
  type        = string
  default     = "../firestore.rules"
}

variable "storage_rules_file" {
  description = "Path to Storage security rules file"
  type        = string
  default     = "../storage.rules"
}

# Enable Firebase services
resource "google_firebase_project" "default" {
  provider = google-beta
  project  = var.project_id
}

# Create Firestore database
resource "google_firestore_database" "database" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"

  depends_on = [google_firebase_project.default]
}

# Deploy Firestore security rules
resource "google_firebaserules_ruleset" "firestore" {
  project = var.project_id
  source {
    files {
      name    = "firestore.rules"
      content = file(var.firestore_rules_file)
    }
  }

  depends_on = [google_firestore_database.database]
}

resource "google_firebaserules_release" "firestore" {
  name         = "cloud.firestore"
  ruleset_name = google_firebaserules_ruleset.firestore.name
  project      = var.project_id

  depends_on = [google_firestore_database.database]

  lifecycle {
    replace_triggered_by = [
      google_firebaserules_ruleset.firestore
    ]
  }
}

# Create Firebase Web App
resource "google_firebase_web_app" "app" {
  provider     = google-beta
  project      = var.project_id
  display_name = "Learning English Web App"
  
  depends_on = [google_firebase_project.default]
}

# Get Firebase Web App config
data "google_firebase_web_app_config" "app" {
  provider   = google-beta
  project    = var.project_id
  web_app_id = google_firebase_web_app.app.app_id
}

# Create default Firebase Storage bucket
resource "google_firebase_storage_bucket" "default" {
  provider  = google-beta
  project   = var.project_id
  bucket_id = "${var.project_id}.appspot.com"
  
  depends_on = [google_firebase_project.default]
}

# Deploy Storage security rules
resource "google_firebaserules_ruleset" "storage" {
  project = var.project_id
  source {
    files {
      name    = "storage.rules"
      content = file(var.storage_rules_file)
    }
  }

  depends_on = [google_firebase_storage_bucket.default]
}

resource "google_firebaserules_release" "storage" {
  name         = "firebase.storage/${google_firebase_storage_bucket.default.bucket_id}"
  ruleset_name = google_firebaserules_ruleset.storage.name
  project      = var.project_id

  depends_on = [google_firebase_storage_bucket.default]

  lifecycle {
    replace_triggered_by = [
      google_firebaserules_ruleset.storage
    ]
  }
}

# Outputs for use in Vercel environment variables
output "firebase_config" {
  description = "Firebase configuration for web app"
  value = {
    api_key             = data.google_firebase_web_app_config.app.api_key
    auth_domain         = data.google_firebase_web_app_config.app.auth_domain
    project_id          = var.project_id
    storage_bucket      = data.google_firebase_web_app_config.app.storage_bucket
    messaging_sender_id = data.google_firebase_web_app_config.app.messaging_sender_id
    app_id              = data.google_firebase_web_app_config.app.app_id
    measurement_id      = data.google_firebase_web_app_config.app.measurement_id
  }
}

output "database_name" {
  description = "Firestore database name"
  value       = google_firestore_database.database.name
}

output "storage_bucket" {
  description = "Firebase Storage bucket name"
  value       = google_firebase_storage_bucket.default.bucket_id
}
