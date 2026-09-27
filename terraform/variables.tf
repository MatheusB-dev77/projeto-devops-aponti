variable "aws_region" {
  description = "Região AWS simulada"
  type        = string
  default     = "us-east-1"
}

variable "localstack_endpoint" {
  description = "Endereço do LocalStack"
  type        = string
  default     = "http://localhost:4566"
}

variable "docker_host" {
  description = "Conexão com o Docker (Docker Desktop no Windows)"
  type        = string
  default     = "npipe:////./pipe/docker_engine"
}

variable "dockerhub_user" {
  description = "Usuário do Docker Hub de onde as imagens são baixadas"
  type        = string
  default     = "hgdcghsvf"
}

variable "image_tag" {
  description = "Tag das imagens (latest ou o SHA de um commit)"
  type        = string
  default     = "latest"
}

variable "db_password" {
  description = "Senha do PostgreSQL"
  type        = string
  default     = "ecommerce123"
  sensitive   = true
}