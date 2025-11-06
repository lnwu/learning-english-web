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

# NextAuth Configuration
variable "auth_secret" {
  description = "NextAuth secret for session encryption (generate with: openssl rand -base64 32)"
  type        = string
  sensitive   = true
}

variable "auth_google_id" {
  description = "Google OAuth Client ID"
  type        = string
  sensitive   = true
}

variable "auth_google_secret" {
  description = "Google OAuth Client Secret"
  type        = string
  sensitive   = true
}

# Firebase Configuration
variable "firebase_project_id" {
  description = "Firebase Project ID"
  type        = string
}

variable "firebase_api_key" {
  description = "Firebase API Key"
  type        = string
  sensitive   = true
}

variable "firebase_auth_domain" {
  description = "Firebase Auth Domain"
  type        = string
}

variable "firebase_storage_bucket" {
  description = "Firebase Storage Bucket"
  type        = string
}

variable "firebase_messaging_sender_id" {
  description = "Firebase Messaging Sender ID"
  type        = string
}

variable "firebase_app_id" {
  description = "Firebase App ID"
  type        = string
}

variable "firebase_measurement_id" {
  description = "Firebase Measurement ID"
  type        = string
}
