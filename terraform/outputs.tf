# Outputs for reference and debugging

output "project_id" {
  description = "Google Cloud Project ID"
  value       = var.gcp_project_id
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

output "next_steps" {
  description = "Next steps after Terraform apply"
  value       = <<-EOT
    ✅ Terraform infrastructure has been successfully created!
    
    SOPS encryption is now set up for managing application secrets.
    
    Next steps:
    
    1. Update .sops.yaml with your project ID:
       sed -i 's/PLACEHOLDER_PROJECT_ID/${var.gcp_project_id}/g' ../.sops.yaml
    
    2. Create and encrypt your secrets:
       cp ../secrets.yaml.example ../secrets.yaml
       # Edit secrets.yaml with your actual values
       sops --encrypt ../secrets.yaml > ../secrets.enc.yaml
       rm ../secrets.yaml
    
    3. Set up minimal GitHub Secrets (only 5 needed):
       - GCP_PROJECT_ID: ${var.gcp_project_id}
       - GCP_SERVICE_ACCOUNT_KEY: (Download JSON key for ${google_service_account.github_actions.email})
       - VERCEL_TOKEN: (Use your Vercel API token)
       - VERCEL_ORG_ID: ${var.vercel_org_id}
       - VERCEL_PROJECT_ID: ${var.vercel_project_id}
    
    4. Commit and push:
       git add ../secrets.enc.yaml ../.sops.yaml
       git commit -m "Add encrypted secrets"
       git push origin master
    
    5. Application secrets are now managed via SOPS in secrets.enc.yaml
    
    For detailed instructions, see docs/SOPS_SECRETS_MANAGEMENT.md
  EOT
  sensitive = false
}
