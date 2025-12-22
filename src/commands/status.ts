import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types/command';
import { getMinecraftStatus } from '../utils/serverApi';
import { env } from '../config/env';
import { logger } from '../config/logger';

export const statusCommand: Command = {
    data: new SlashCommandBuilder()
        .setName(`status`)
        .setDescription(`Affiche le statut du serveur Minecraft`),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        if (!env.minecraftServerHost) {
            await interaction.editReply({
                content: `❌ Configuration manquante (MINECRAFT_SERVER_HOST)`,
            });
            return;
        }

        try {
            await interaction.editReply({
                content: `🔍 Récupération du statut du serveur...`,
            });

            const statusResult = await getMinecraftStatus(env.minecraftServerHost, env.minecraftApiPort);

            if (statusResult.success) {
                const statusEmoji = {
                    online: `🟢`,
                    offline: `🔴`,
                    starting: `🟡`,
                    stopping: `🟠`,
                }[statusResult.status || `offline`] || `⚪`;

                let response = `${statusEmoji} **Statut du serveur:** ${statusResult.status || `inconnu`}`;

                if (statusResult.players) {
                    response += `\n👥 **Joueurs:** ${statusResult.players.online}/${statusResult.players.max}`;
                }

                if (statusResult.message) {
                    response += `\n📝 ${statusResult.message}`;
                }

                await interaction.editReply({ content: response });
            } else {
                await interaction.editReply({
                    content: `❌ Impossible de récupérer le statut du serveur\n${statusResult.message ? `📝 ${statusResult.message}` : ``}`,
                });
            }
        } catch (error) {
            logger.error(error, `Erreur lors de l'exécution de la commande /status`);
            await interaction.editReply({
                content: `❌ Une erreur inattendue s'est produite`,
            });
        }
    },
};
