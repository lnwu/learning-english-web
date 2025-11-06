# Google Cloud Secret Manager module
# Creates and manages secrets for the application

variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
}

variable "secrets" {
  description = "Map of secrets to create"
  type = map(object({
    value       = string
    description = string
  }))
}

# Create secrets in Secret Manager
resource "google_secret_manager_secret" "secrets" {
  for_each = var.secrets

  secret_id = each.key
  project   = var.project_id

  replication {
    auto {}
  }

  labels = {
    managed_by = "terraform"
    app        = "learning-english"
  }
}

# Add secret versions with actual values
resource "google_secret_manager_secret_version" "secret_versions" {
  for_each = var.secrets

  secret      = google_secret_manager_secret.secrets[each.key].id
  secret_data = each.value.value
}

# Output secret names for reference
output "secret_names" {
  description = "Names of created secrets"
  value       = [for s in google_secret_manager_secret.secrets : s.secret_id]
}

output "secret_ids" {
  description = "Full secret resource IDs"
  value       = { for k, s in google_secret_manager_secret.secrets : k => s.id }
}
