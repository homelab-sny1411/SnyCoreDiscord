import { REST, Routes } from 'discord.js';
import { env } from './config/env';
import { logger } from './config/logger';
import { commands } from './commands';

const commandsData = Array.from(commands.values()).map((command) => command.data.toJSON());

const rest = new REST({ version: '10' }).setToken(env.token);

const deployCommands = async () => {
    try {
        logger.info(`Début du déploiement de ${commandsData.length} commande(s) slash...`);

        if (env.guildId) {
            await rest.put(Routes.applicationGuildCommands(env.clientId, env.guildId), {
                body: commandsData,
            });
            logger.info(`Commandes slash déployées avec succès pour le serveur ${env.guildId}`);
        } else {
            await rest.put(Routes.applicationCommands(env.clientId), {
                body: commandsData,
            });
            logger.info(`Commandes slash déployées globalement avec succès`);
        }
    } catch (error) {
        logger.error(error, 'Erreur lors du déploiement des commandes slash');
        process.exit(1);
    }
};

deployCommands();
