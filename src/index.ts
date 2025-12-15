import { Client, GatewayIntentBits, Events } from 'discord.js';
import { env } from './config/env';
import { logger } from './config/logger';
import { commands } from './commands';

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, () => {
    logger.info(`Connecté en tant que ${client.user?.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);

    if (!command) {
        logger.warn(`Commande inconnue: ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        logger.error(error, `Erreur lors de l'exécution de la commande ${interaction.commandName}`);

        const errorMessage = { content: `Une erreur s'est produite lors de l'exécution de la commande.`, ephemeral: true };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

client.login(env.token).catch((err) => {
    logger.fatal(err, `Échec de la connexion à Discord`);
    process.exit(1);
});
