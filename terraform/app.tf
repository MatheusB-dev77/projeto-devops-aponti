resource "docker_network" "shop" {
  name = "shopadmin-tf-net"
}

resource "docker_volume" "pgdata" {
  name = "shopadmin-tf-pgdata"
}

# ---------- Imagens ----------
resource "docker_image" "postgres" {
  name         = "postgres:16-alpine"
  keep_locally = true
}

resource "docker_image" "redis" {
  name         = "redis:7-alpine"
  keep_locally = true
}

resource "docker_image" "api" {
  name         = "${var.dockerhub_user}/ecommerce-api:${var.image_tag}"
  keep_locally = true
}

resource "docker_image" "frontend" {
  name         = "${var.dockerhub_user}/ecommerce-frontend:${var.image_tag}"
  keep_locally = true
}

# ---------- Banco de dados ----------
resource "docker_container" "postgres" {
  name    = "tf-shop-postgres"
  image   = docker_image.postgres.image_id
  restart = "unless-stopped"

  env = [
    "POSTGRES_DB=ecommerce",
    "POSTGRES_USER=ecommerce",
    "POSTGRES_PASSWORD=${var.db_password}",
  ]

  volumes {
    volume_name    = docker_volume.pgdata.name
    container_path = "/var/lib/postgresql/data"
  }

  networks_advanced {
    name    = docker_network.shop.name
    aliases = ["postgres"]
  }

  healthcheck {
    test     = ["CMD-SHELL", "pg_isready -U ecommerce -d ecommerce"]
    interval = "5s"
    timeout  = "5s"
    retries  = 10
  }

  wait         = true
  wait_timeout = 120
}

# ---------- Cache ----------
resource "docker_container" "redis" {
  name    = "tf-shop-redis"
  image   = docker_image.redis.image_id
  restart = "unless-stopped"

  networks_advanced {
    name    = docker_network.shop.name
    aliases = ["redis"]
  }

  healthcheck {
    test     = ["CMD", "redis-cli", "ping"]
    interval = "5s"
    timeout  = "5s"
    retries  = 10
  }

  wait         = true
  wait_timeout = 60
}

# ---------- API ----------
resource "docker_container" "api" {
  name    = "tf-shop-api"
  image   = docker_image.api.image_id
  restart = "unless-stopped"

  env = [
    "NODE_ENV=production",
    "PORT=3333",
    "DB_HOST=postgres",
    "DB_PORT=5432",
    "DB_NAME=ecommerce",
    "DB_USER=ecommerce",
    "DB_PASSWORD=${var.db_password}",
    "REDIS_HOST=redis",
    "REDIS_PORT=6379",
    "RATE_LIMIT_MAX_REQUESTS=1000",
  ]

  ports {
    internal = 3333
    external = 3333
  }

  networks_advanced {
    name    = docker_network.shop.name
    aliases = ["api"]
  }

  depends_on = [docker_container.postgres, docker_container.redis]
}

# ---------- Frontend ----------
resource "docker_container" "frontend" {
  name    = "tf-shop-frontend"
  image   = docker_image.frontend.image_id
  restart = "unless-stopped"

  ports {
    internal = 80
    external = 8080
  }

  networks_advanced {
    name = docker_network.shop.name
  }

  depends_on = [docker_container.api]
}