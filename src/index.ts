import { Client, GatewayIntentBits, Events } from 'discord.js';
import { env } from './config/env';
import { logger } from './config/logger';
import { commands } from './commands';
import { createErrorEmbed } from './utils/embeds';

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, () => {
    logger.info(`Connecté en tant que ${client.user?.tag}`);
});

client.on(Events.InteractionCreate, (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);

    if (!command) {
        logger.warn(`Commande inconnue: ${interaction.commandName}`);
        return;
    }

    command.execute(interaction).catch((error) => {
        logger.error(error, `Erreur lors de l'exécution de la commande ${interaction.commandName}`);

        const errorEmbed = createErrorEmbed(
            `❌ Erreur`,
            `Une erreur s'est produite lors de l'exécution de la commande.`,
        );

        if (interaction.replied || interaction.deferred) {
            void interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        } else {
            void interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    });
});

client.login(env.token).catch((err) => {
    logger.fatal(err, `Échec de la connexion à Discord`);
    process.exit(1);
});
