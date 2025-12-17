variable "image" {
  description = "Docker image to deploy"
  type        = string
}

variable "registry_user" {
  description = "Docker registry username"
  type        = string
}

variable "registry_password" {
  description = "Docker registry password"
  type        = string
}

variable "discord_token" {
  description = "Discord bot token"
  type        = string
}

variable "client_id" {
  description = "Discord client ID"
  type        = string
}

variable "guild_id" {
  description = "Discord guild ID (optional)"
  type        = string
  default     = ""
}

variable "minecraft_server_host" {
  description = "Minecraft server host"
  type        = string
  default     = ""
}

variable "minecraft_server_mac" {
  description = "Minecraft server MAC address"
  type        = string
  default     = ""
}

variable "minecraft_server_port" {
  description = "Minecraft server port"
  type        = string
  default     = "25565"
}

variable "minecraft_api_port" {
  description = "Minecraft API port"
  type        = string
  default     = "1411"
}

variable "minecraft_wol_wait_time" {
  description = "Wake-on-LAN wait time in ms"
  type        = string
  default     = "30000"
}

job "discord-bot" {
  datacenters = ["homelab"]
  type        = "service"

  update {
    max_parallel      = 1
    min_healthy_time  = "30s"
    healthy_deadline  = "5m"
    progress_deadline = "10m"
    auto_revert       = true
  }

  group "bot" {
    count = 1  # UN SEUL bot, pas de réplication

    restart {
      attempts = 3
      interval = "5m"
      delay    = "15s"
      mode     = "fail"
    }

    task "snyCoreDiscord" {
      driver = "docker"

      config {
        image = var.image

        network_mode = "host"

        auth {
          username = var.registry_user
          password = var.registry_password
        }

        logging {
          type = "json-file"
          config {
            max-size = "10m"
            max-file = "3"
          }
        }
      }

      env {
        NODE_ENV                  = "production"
        DISCORD_TOKEN             = var.discord_token
        CLIENT_ID                 = var.client_id
        GUILD_ID                  = var.guild_id
        MINECRAFT_SERVER_HOST     = var.minecraft_server_host
        MINECRAFT_SERVER_MAC      = var.minecraft_server_mac
        MINECRAFT_SERVER_PORT     = var.minecraft_server_port
        MINECRAFT_API_PORT        = var.minecraft_api_port
        MINECRAFT_WOL_WAIT_TIME   = var.minecraft_wol_wait_time
      }

      resources {
        cpu    = 200   # Bot très léger
        memory = 256   # Suffisant pour discord.js
      }

      # Le bot Discord n'expose pas de port HTTP, donc pas de health check HTTP
      # Nomad surveillera que le processus reste actif
    }
  }
}
