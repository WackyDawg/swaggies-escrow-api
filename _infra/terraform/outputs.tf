output "gke_cluster_name" {
  value       = google_container_cluster.Swaggies.name
  description = "GKE cluster name"
}

output "gke_cluster_endpoint" {
  value       = google_container_cluster.Swaggies.endpoint
  description = "GKE cluster API endpoint"
  sensitive   = true
}

output "artifact_registry_url" {
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${var.app_name}"
  description = "Artifact Registry base URL for image pushes"
}

output "ingress_static_ip" {
  value       = google_compute_global_address.ingress_ip.address
  description = "Static IP to configure your DNS A record with"
}

output "gcp_service_account_email" {
  value       = google_service_account.Swaggies_sa.email
  description = "GCP Service Account used by Workload Identity"
}

output "connect_command" {
  value       = "gcloud container clusters get-credentials ${google_container_cluster.Swaggies.name} --region ${var.region} --project ${var.project_id}"
  description = "Command to get kubectl credentials for the GKE cluster"
}
