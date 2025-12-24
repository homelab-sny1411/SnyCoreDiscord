# SnyCoreDiscord

Bot Discord pour la gestion et le monitoring d'un serveur Minecraft dans un environnement homelab.

## Fonctionnalités

- **Démarrage automatique** : Wake-on-LAN pour réveiller la machine, puis démarrage du serveur Minecraft
- **Contrôle à distance** : Démarrage, arrêt et redémarrage du serveur via commandes Discord
- **Monitoring en temps réel** : Affichage du statut du serveur, nombre de joueurs, version et MOTD
- **Auto-shutdown** : Surveillance du service d'extinction automatique du serveur
- **Logging structuré** : Logs détaillés avec Pino pour un débogage efficace
- **Configuration flexible** : Variables d'environnement pour une configuration simple

## Prérequis

- Node.js 18+
- Un serveur Discord avec permissions de bot
- Un serveur Minecraft configuré avec [arch-api-minecraft](https://github.com/homelab-sny1411/arch-api-minecraft)
- Wake-on-LAN configuré sur le serveur cible

## Installation

1. Cloner le dépôt :
```bash
git clone https://github.com/homelab-sny1411/SnyCoreDiscord.git
cd SnyCoreDiscord
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
```bash
cp .env.example .env
```

4. Éditer le fichier `.env` avec vos informations :
```env
# Discord Configuration
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
GUILD_ID=your_discord_guild_id

# Minecraft Server Configuration
MINECRAFT_SERVER_HOST=192.168.1.100
MINECRAFT_SERVER_MAC=AA:BB:CC:DD:EE:FF
MINECRAFT_SERVER_PORT=25565
MINECRAFT_API_PORT=1411
MINECRAFT_WOL_WAIT_TIME=30000
```

## Configuration du Bot Discord

1. Créer une application sur le [Discord Developer Portal](https://discord.com/developers/applications)
2. Créer un bot et récupérer le token
3. Activer les **Privileged Gateway Intents** nécessaires
4. Inviter le bot sur votre serveur avec les permissions appropriées :
   - Applications Commands
   - Send Messages
   - Embed Links

## Utilisation

### Développement

```bash
# Compiler le TypeScript en mode watch
npm run dev

# Dans un autre terminal, lancer le bot
npm start
```

### Production

```bash
# Compiler le projet
npm run build

# Déployer les commandes slash
npm run deploy-commands

# Lancer le bot
npm start
```

## Commandes Discord

### `/start`
Démarre le serveur Minecraft.
- Vérifie si la machine est en ligne (ping)
- Si hors ligne : envoie un Wake-on-LAN
- Attend que la machine démarre
- Lance le serveur Minecraft via l'API

**Exemple de réponse :**
```
✅ Serveur Minecraft démarré avec succès !
📝 Minecraft server started successfully
```

### `/stop`
Arrête le serveur Minecraft.
- Envoie une commande d'arrêt à l'API
- Déclenche l'extinction du système (selon configuration de l'API)

**Exemple de réponse :**
```
✅ Serveur Minecraft arrêté avec succès !
📝 Minecraft server stopped. System shutting down...
```

### `/restart`
Redémarre le serveur Minecraft.
- Arrête puis redémarre le serveur via l'API

**Exemple de réponse :**
```
✅ Serveur Minecraft redémarré avec succès !
📝 Minecraft server restarted successfully
```

### `/status`
Affiche le statut actuel du serveur Minecraft.
- État du service (running/stopped/starting/stopping)
- Nombre de joueurs connectés
- Version du serveur
- Message du jour (MOTD)

**Exemple de réponse :**
```
🟢 Statut du serveur: running
👥 Joueurs: 3/20
📦 Version: 1.21.4
💬 MOTD: Un serveur Minecraft
```

### `/auto-shutdown-status`
Affiche l'état du service d'extinction automatique.
- État activé/désactivé
- Délai d'inactivité configuré
- État actuel (actif/inactif)

**Exemple de réponse :**
```
✅ Auto-shutdown: Activé
⏱️ Délai d'inactivité: 30 minutes
💤 État: Inactif
```

## Architecture du Projet

```
src/
├── commands/               # Commandes Discord slash
│   ├── start.ts           # Commande de démarrage
│   ├── stop.ts            # Commande d'arrêt
│   ├── restart.ts         # Commande de redémarrage
│   ├── status.ts          # Commande de statut
│   ├── auto-shutdown-status.ts  # Statut auto-shutdown
│   └── index.ts           # Export des commandes
├── config/                # Configuration
│   ├── env.ts             # Variables d'environnement
│   └── logger.ts          # Configuration Pino
├── types/                 # Définitions TypeScript
│   ├── command.ts         # Type pour les commandes
│   └── wakeonlan.d.ts     # Types pour Wake-on-LAN
├── utils/                 # Utilitaires
│   ├── ping.ts            # Ping du serveur
│   ├── wol.ts             # Wake-on-LAN
│   └── serverApi.ts       # Client API Minecraft
├── deploy-commands.ts     # Script de déploiement des commandes
└── index.ts               # Point d'entrée du bot
```

## API Minecraft

Ce bot communique avec [arch-api-minecraft](https://github.com/homelab-sny1411/arch-api-minecraft), une API REST pour la gestion du serveur Minecraft.

### Endpoints utilisés

- `POST /minecraft/start` - Démarrer le serveur
- `POST /minecraft/stop` - Arrêter le serveur
- `POST /minecraft/restart` - Redémarrer le serveur
- `GET /minecraft/status` - Obtenir le statut
- `GET /minecraft/auto-shutdown/status` - Statut auto-shutdown

## Scripts NPM

| Script | Description |
|--------|-------------|
| `npm run build` | Compile le TypeScript en JavaScript |
| `npm run dev` | Compile en mode watch |
| `npm start` | Lance le bot compilé |
| `npm run deploy-commands` | Déploie les commandes slash sur Discord |
| `npm run lint` | Vérifie le code avec ESLint |
| `npm run lint:fix` | Corrige automatiquement les erreurs ESLint |

## Technologies Utilisées

- **Discord.js** : Bibliothèque pour interagir avec l'API Discord
- **TypeScript** : Typage statique pour plus de robustesse
- **Pino** : Logger JSON haute performance
- **Axios** : Client HTTP pour les appels API
- **Wake-on-LAN** : Réveil de machines à distance
- **dotenv** : Gestion des variables d'environnement

## Déploiement

### Avec Nomad (Production)

Le projet utilise HashiCorp Nomad pour le déploiement automatisé. Les secrets sont configurés via GitHub Secrets et injectés lors du déploiement.

Variables requises dans GitHub Secrets :
- `DISCORD_TOKEN`
- `CLIENT_ID`
- `GUILD_ID`
- `MINECRAFT_SERVER_HOST`
- `MINECRAFT_SERVER_MAC`

### Avec systemd

1. Créer un fichier de service `/etc/systemd/system/snycore-discord.service` :
```ini
[Unit]
Description=SnyCoreDiscord Bot
After=network.target

[Service]
Type=simple
User=discord
WorkingDirectory=/opt/SnyCoreDiscord
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
EnvironmentFile=/opt/SnyCoreDiscord/.env

[Install]
WantedBy=multi-user.target
```

2. Activer et démarrer le service :
```bash
sudo systemctl daemon-reload
sudo systemctl enable snycore-discord
sudo systemctl start snycore-discord
```

### Avec Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

CMD ["node", "dist/index.js"]
```

```bash
docker build -t snycore-discord .
docker run -d --env-file .env snycore-discord
```

## Développement

### Ajouter une nouvelle commande

1. Créer un nouveau fichier dans `src/commands/` :
```typescript
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types/command';

export const myCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('my-command')
        .setDescription('Description de ma commande'),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply('Hello World!');
    },
};
```

2. Exporter la commande dans `src/commands/index.ts` :
```typescript
export { myCommand } from './my-command';
```

3. Déployer les commandes :
```bash
npm run deploy-commands
```

## Licence

ISC

## Auteur

Mattéo Humez - [homelab-sny1411](https://github.com/homelab-sny1411)
