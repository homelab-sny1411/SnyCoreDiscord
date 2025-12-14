import { Client, GatewayIntentBits } from 'discord.js';
import { env } from './config/env';
import { logger } from './config/logger';

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

client.once(`ready`, () => {
    logger.info(`Connecté en tant que ${client.user?.tag}`);
});

client.login(env.token).catch((err) => {
    logger.fatal(err, `Échec de la connexion à Discord`);
    process.exit(1);
});
