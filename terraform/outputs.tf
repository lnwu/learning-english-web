# Outputs for reference and debugging

output "project_id" {
  description = "Google Cloud Project ID"
  value       = var.gcp_project_id
}

output "firebase_config" {
  description = "Firebase configuration (auto-generated and set in Vercel)"
  value       = module.firebase.firebase_config
  sensitive   = false
}

output "oauth_client_id" {
  description = "Google OAuth Client ID (auto-generated and set in Vercel)"
  value       = module.identity_platform.oauth_client_id
  sensitive   = false
}

output "github_actions_service_account_email" {
  description = "Email of the GitHub Actions service account"
  value       = google_service_account.github_actions.email
}

output "kms_key_ring" {
  description = "KMS Key Ring for SOPS encryption"
  value       = google_kms_key_ring.sops.name
}

output "kms_crypto_key" {
  description = "KMS Crypto Key for SOPS encryption"
  value       = google_kms_crypto_key.sops.name
}

output "kms_key_id" {
  description = "Full KMS key ID for SOPS configuration"
  value       = "projects/${var.gcp_project_id}/locations/global/keyRings/${google_kms_key_ring.sops.name}/cryptoKeys/${google_kms_crypto_key.sops.name}"
}

output "secret_manager_secrets" {
  description = "List of secrets created in Secret Manager (now minimal - only provider credentials)"
  value       = module.secret_manager.secret_names
}

output "vercel_project_url" {
  description = "Vercel project URL"
  value       = module.vercel_deployment.project_url
}

output "setup_complete" {
  description = "Setup status and next steps"
  value       = <<-EOT
    ✅ Infrastructure Setup Complete - NO MANUAL SECRETS NEEDED!
    
    All credentials have been AUTO-GENERATED and configured in Vercel:
    
    ✅ Firebase Project: ${var.gcp_project_id}
    ✅ Firestore Database: Created with security rules
    ✅ Google OAuth Client: Auto-created (ID: ${module.identity_platform.oauth_client_id})
    ✅ Vercel Environment Variables: All 10 secrets set automatically
    ✅ NextAuth Secret: Auto-generated
    
    What Terraform Just Did:
    - Created Firebase project with Firestore database
    - Deployed firestore.rules for user-scoped data access
    - Generated OAuth 2.0 client for Google authentication
    - Generated random AUTH_SECRET for NextAuth
    - Set ALL 10 environment variables in Vercel automatically
    - Configured authorized domains: localhost, ${var.vercel_production_domain}
    - No encrypted files needed, no manual secrets!
    
    Final Step (One-time OAuth Setup):
    1. Go to: https://console.cloud.google.com/apis/credentials?project=${var.gcp_project_id}
    2. Click on "Learning English OAuth Client"
    3. Add Authorized JavaScript origins:
       - http://localhost:3000
       - https://${var.vercel_production_domain}
    4. Add Authorized redirect URIs:
       - http://localhost:3000/api/auth/callback/google
       - https://${var.vercel_production_domain}/api/auth/callback/google
    5. Click Save
    
    That's it! Your app is ready to deploy:
    - Push to GitHub master branch
    - Vercel deploys automatically with all secrets configured
    - No encrypted secrets file needed
    - No manual environment variable configuration
    
    Production URL: https://${var.vercel_production_domain}
    
    All secrets are managed by Terraform in the state file (keep it secure!)
  EOT
  sensitive = false
}
