resource "docker_image" "prometheus" {
  name         = "prom/prometheus:v3.4.0"
  keep_locally = true
}

resource "docker_image" "grafana" {
  name         = "grafana/grafana:12.0.0"
  keep_locally = true
}

# ---------- Prometheus: coleta as métricas da API ----------
resource "docker_container" "prometheus" {
  name    = "tf-shop-prometheus"
  image   = docker_image.prometheus.image_id
  restart = "unless-stopped"

  ports {
    internal = 9090
    external = 9090
  }

  networks_advanced {
    name    = docker_network.shop.name
    aliases = ["prometheus"]
  }

  upload {
    file    = "/etc/prometheus/prometheus.yml"
    content = file("${path.module}/../monitoring/prometheus/prometheus.yml")
  }

  depends_on = [docker_container.api]
}

# ---------- Grafana: dashboards ----------
resource "docker_container" "grafana" {
  name    = "tf-shop-grafana"
  image   = docker_image.grafana.image_id
  restart = "unless-stopped"

  env = [
    "GF_SECURITY_ADMIN_USER=admin",
    "GF_SECURITY_ADMIN_PASSWORD=admin",
  ]

  # A porta 3000 da sua máquina está ocupada, então usamos a 3001
  ports {
    internal = 3000
    external = 3001
  }

  networks_advanced {
    name = docker_network.shop.name
  }

  upload {
    file    = "/etc/grafana/provisioning/datasources/datasource.yml"
    content = file("${path.module}/../monitoring/grafana/provisioning/datasources/datasource.yml")
  }

  upload {
    file    = "/etc/grafana/provisioning/dashboards/dashboards.yml"
    content = file("${path.module}/../monitoring/grafana/provisioning/dashboards/dashboards.yml")
  }

  upload {
    file    = "/etc/grafana/provisioning/dashboards/api-dashboard.json"
    content = file("${path.module}/../monitoring/grafana/provisioning/dashboards/api-dashboard.json")
  }

  depends_on = [docker_container.prometheus]
}