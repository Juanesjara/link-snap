output "ec2_public_ip" {
  description = "IP pública del servidor backend"
  value       = aws_instance.backend.public_ip
}

output "rds_endpoint" {
  description = "Endpoint de la base de datos RDS"
  value       = aws_db_instance.postgres.endpoint
  sensitive   = true
}

output "cloudfront_url" {
  description = "URL del frontend en CloudFront"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "api_url" {
  description = "URL HTTPS del backend vía CloudFront"
  value       = "https://${aws_cloudfront_distribution.api.domain_name}"
}
