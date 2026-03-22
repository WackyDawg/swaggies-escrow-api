variable "billing_account_id" {
  description = "The ID of the billing account to associate with the budget"
  type        = string
}

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP region for all resources"
  type        = string
  default     = "us-central1"
}

variable "app_name" {
  description = "Application name — used in resource naming"
  type        = string
  default     = "Swaggies"
}

variable "cluster_name" {
  description = "GKE cluster name"
  type        = string
  default     = "Swaggies-cluster"
}

variable "authorized_networks" {
  description = "CIDR blocks allowed to access the GKE control plane"
  type = list(object({
    cidr_block   = string
    display_name = string
  }))
  default = [
    {
      cidr_block   = "0.0.0.0/0"  # Restrict this to your office/VPN IPs in production
      display_name = "all"
    }
  ]
}
