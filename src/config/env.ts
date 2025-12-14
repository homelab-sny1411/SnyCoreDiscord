import 'dotenv/config';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId) {
    throw new Error(`Variables d'environnement manquantes`);
}

export const env = {
    token,
    clientId,
    guildId,
};

