# Input variables for Terraform configuration

# Google Cloud Project Configuration
variable "gcp_project_id" {
  description = "Google Cloud Project ID"
  type        = string
}

variable "gcp_region" {
  description = "Google Cloud Region"
  type        = string
  default     = "us-central1"
}

# GitHub Configuration
variable "github_repo" {
  description = "GitHub repository in format 'owner/repo'"
  type        = string
  default     = "lnwu/learning-english"
}

# Vercel Configuration
variable "vercel_token" {
  description = "Vercel API Token"
  type        = string
  sensitive   = true
}

variable "vercel_org_id" {
  description = "Vercel Organization ID"
  type        = string
}

variable "vercel_project_id" {
  description = "Vercel Project ID"
  type        = string
}

variable "vercel_project_name" {
  description = "Vercel Project Name"
  type        = string
  default     = "learning-english"
}

# Note: Application secrets (AUTH_SECRET, OAuth credentials, Firebase config)
# are now stored in the encrypted secrets.enc.yaml file in the repository
# and decrypted during CI/CD deployment using SOPS with Google Cloud KMS
