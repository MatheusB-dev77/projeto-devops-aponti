output "vpc_id" {
  value = aws_vpc.main.id
}

output "subnet_id" {
  value = aws_subnet.public.id
}

output "security_group_id" {
  value = aws_security_group.app.id
}

output "bucket_s3" {
  value = aws_s3_bucket.artifacts.bucket
}

output "frontend_url" {
  value = "http://localhost:8080"
}

output "api_url" {
  value = "http://localhost:3333/health"
}

output "prometheus_url" {
  value = "http://localhost:9090/targets"
}

output "grafana_url" {
  value = "http://localhost:3001 (usuário: admin / senha: admin)"
}