variable "region" {
  description = "Región de AWS"
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Nombre de la aplicación, usado para nombrar recursos"
  type        = string
  default     = "linksnap"
}

variable "db_password" {
  description = "Contraseña de la base de datos RDS"
  type        = string
  sensitive   = true
}
