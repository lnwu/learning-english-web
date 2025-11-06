# Vercel deployment module
# Manages Vercel project and environment variables

variable "project_name" {
  description = "Vercel project name"
  type        = string
}

variable "org_id" {
  description = "Vercel organization ID"
  type        = string
}

variable "project_id" {
  description = "Vercel project ID"
  type        = string
}

variable "git_repository" {
  description = "Git repository configuration"
  type = object({
    type              = string
    repo              = string
    production_branch = string
  })
}

variable "environment_variables" {
  description = "Environment variables for Vercel deployment"
  type = map(object({
    value     = string
    target    = list(string)
    sensitive = bool
  }))
}

# Import existing Vercel project
# Note: Vercel projects are typically created via the Vercel dashboard or CLI
# This resource manages the configuration of an existing project
data "vercel_project" "main" {
  name = var.project_name
}

# Configure environment variables
resource "vercel_project_environment_variable" "env_vars" {
  for_each = var.environment_variables

  project_id = var.project_id
  key        = each.key
  value      = each.value.value
  target     = each.value.target
  sensitive  = each.value.sensitive
}

# Output project information
output "project_url" {
  description = "Vercel project URL (may differ if custom domain is configured)"
  value       = "https://${var.project_name}.vercel.app"
}

output "project_id" {
  description = "Vercel project ID"
  value       = var.project_id
}

output "deployment_note" {
  description = "Note about deployment URLs"
  value       = "The project URL shown is the default Vercel domain. If a custom domain is configured, use the Vercel dashboard to view the actual deployment URL."
}
