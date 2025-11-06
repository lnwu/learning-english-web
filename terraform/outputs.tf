# Outputs for reference and debugging

output "project_id" {
  description = "Google Cloud Project ID"
  value       = var.gcp_project_id
}

output "github_actions_service_account_email" {
  description = "Email of the GitHub Actions service account"
  value       = google_service_account.github_actions.email
}

output "secret_manager_secrets" {
  description = "List of secrets created in Secret Manager"
  value       = module.secret_manager.secret_names
}

output "vercel_project_url" {
  description = "Vercel project deployment URL"
  value       = module.vercel_deployment.project_url
  sensitive   = false
}

output "vercel_project_id" {
  description = "Vercel Project ID"
  value       = var.vercel_project_id
}

output "next_steps" {
  description = "Next steps after Terraform apply"
  value       = <<-EOT
    ✅ Terraform infrastructure has been successfully created!
    
    Next steps:
    1. Set up GitHub Secrets in your repository:
       - GCP_PROJECT_ID: ${var.gcp_project_id}
       - GCP_SERVICE_ACCOUNT_KEY: (Download JSON key for ${google_service_account.github_actions.email})
       - VERCEL_TOKEN: (Use your Vercel API token)
       - VERCEL_ORG_ID: ${var.vercel_org_id}
       - VERCEL_PROJECT_ID: ${var.vercel_project_id}
    
    2. Push changes to master branch to trigger deployment
    
    3. Verify deployment at: ${module.vercel_deployment.project_url}
    
    For detailed instructions, see terraform/README.md
  EOT
  sensitive = false
}
