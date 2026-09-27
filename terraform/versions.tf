terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

# AWS apontando para o LocalStack (AWS simulada na máquina local)
provider "aws" {
  region                      = var.aws_region
  access_key                  = "test"
  secret_key                  = "test"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true
  s3_use_path_style           = true

  endpoints {
    ec2 = var.localstack_endpoint
    s3  = var.localstack_endpoint
    sts = var.localstack_endpoint
    iam = var.localstack_endpoint
  }

  default_tags {
    tags = {
      Project   = "ShopAdmin"
      ManagedBy = "Terraform"
    }
  }
}

# Docker local (Docker Desktop no Windows)
provider "docker" {
  host = var.docker_host
}
