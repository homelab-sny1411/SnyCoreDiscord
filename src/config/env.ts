import 'dotenv/config';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const minecraftServerHost = process.env.MINECRAFT_SERVER_HOST;
const minecraftServerMac = process.env.MINECRAFT_SERVER_MAC;
const minecraftServerPort = process.env.MINECRAFT_SERVER_PORT || `25565`;
const minecraftApiPort = process.env.MINECRAFT_API_PORT || `1411`;
const minecraftWolWaitTime = process.env.MINECRAFT_WOL_WAIT_TIME || `30000`;

if (!token || !clientId) {
    throw new Error(`Variables d'environnement manquantes`);
}

export const env = {
    token,
    clientId,
    guildId,
    minecraftServerHost,
    minecraftServerMac,
    minecraftServerPort: parseInt(minecraftServerPort, 10),
    minecraftApiPort: parseInt(minecraftApiPort, 10),
    minecraftWolWaitTime: parseInt(minecraftWolWaitTime, 10),
};

