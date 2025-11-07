# Identity Platform module
# Creates Google OAuth 2.0 client for authentication with automatic redirect URI configuration

variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
}

variable "project_number" {
  description = "Google Cloud Project Number"
  type        = string
}

variable "app_name" {
  description = "Application display name"
  type        = string
  default     = "Learning English"
}

variable "production_domain" {
  description = "Production domain for OAuth redirect"
  type        = string
}

# Enable Identity Platform
resource "google_identity_platform_config" "default" {
  project = var.project_id
  
  sign_in {
    allow_duplicate_emails = false
    
    anonymous {
      enabled = true
    }
  }

  # Authorized domains for OAuth
  authorized_domains = [
    "localhost",
    var.production_domain,
  ]
}

# Configure Google as auth provider
resource "google_identity_platform_default_supported_idp_config" "google" {
  project       = var.project_id
  idp_id        = "google.com"
  client_id     = google_iap_client.oauth_client.client_id
  client_secret = google_iap_client.oauth_client.secret
  enabled       = true

  depends_on = [google_identity_platform_config.default]
}

# Create OAuth 2.0 brand (required for IAP client)
resource "google_iap_brand" "project_brand" {
  support_email     = "lnwu@users.noreply.github.com"
  application_title = var.app_name
  project           = var.project_number
}

# Create OAuth 2.0 client
resource "google_iap_client" "oauth_client" {
  display_name = "${var.app_name} OAuth Client"
  brand        = google_iap_brand.project_brand.name
}

# Note: After creation, you need to manually add redirect URIs in GCP Console:
# 1. Go to: https://console.cloud.google.com/apis/credentials
# 2. Click on the OAuth client
# 3. Add Authorized JavaScript origins:
#    - http://localhost:3000
#    - https://${var.production_domain}
# 4. Add Authorized redirect URIs:
#    - http://localhost:3000/api/auth/callback/google
#    - https://${var.production_domain}/api/auth/callback/google

# Output OAuth credentials for use in NextAuth
output "oauth_client_id" {
  description = "OAuth 2.0 Client ID for Google authentication"
  value       = google_iap_client.oauth_client.client_id
  sensitive   = false
}

output "oauth_client_secret" {
  description = "OAuth 2.0 Client Secret for Google authentication"
  value       = google_iap_client.oauth_client.secret
  sensitive   = true
}

output "production_domain" {
  description = "Production domain for OAuth configuration"
  value       = var.production_domain
}

output "oauth_setup_instructions" {
  description = "Instructions for completing OAuth setup"
  value       = <<-EOT
    OAuth Client Created Successfully!
    
    Client ID: ${google_iap_client.oauth_client.client_id}
    
    IMPORTANT: Complete OAuth setup by adding redirect URIs:
    1. Go to: https://console.cloud.google.com/apis/credentials?project=${var.project_id}
    2. Click on: "${var.app_name} OAuth Client"
    3. Add Authorized JavaScript origins:
       - http://localhost:3000
       - https://${var.production_domain}
    4. Add Authorized redirect URIs:
       - http://localhost:3000/api/auth/callback/google
       - https://${var.production_domain}/api/auth/callback/google
    5. Click "Save"
    
    These URIs are required for NextAuth to work correctly.
  EOT
}
