import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types/command';
import { getAutoShutdownStatus } from '../utils/serverApi';
import { env } from '../config/env';
import { logger } from '../config/logger';

export const autoShutdownStatusCommand: Command = {
    data: new SlashCommandBuilder()
        .setName(`auto-shutdown-status`)
        .setDescription(`Affiche le statut du service d'extinction automatique du serveur`),

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
                content: `🔍 Récupération du statut de l'auto-shutdown...`,
            });

            const statusResult = await getAutoShutdownStatus(env.minecraftServerHost, env.minecraftApiPort);

            if (statusResult.success && statusResult.data) {
                const enabledEmoji = statusResult.data.enabled ? `✅` : `❌`;
                const enabledText = statusResult.data.enabled ? `Activé` : `Désactivé`;

                let response = `${enabledEmoji} **Auto-shutdown:** ${enabledText}`;

                if (statusResult.data.enabled) {
                    response += `\n⏱️ **Délai d'inactivité:** ${statusResult.data.idleMinutes} minutes`;
                    const idleEmoji = statusResult.data.isIdle ? `💤` : `⚡`;
                    const idleText = statusResult.data.isIdle ? `Inactif` : `Actif`;
                    response += `\n${idleEmoji} **État:** ${idleText}`;
                }

                if (statusResult.message) {
                    response += `\n📝 ${statusResult.message}`;
                }

                await interaction.editReply({ content: response });
            } else {
                await interaction.editReply({
                    content: `❌ Impossible de récupérer le statut de l'auto-shutdown\n${statusResult.message ? `📝 ${statusResult.message}` : ``}`,
                });
            }
        } catch (error) {
            logger.error(error, `Erreur lors de l'exécution de la commande /auto-shutdown-status`);
            await interaction.editReply({
                content: `❌ Une erreur inattendue s'est produite`,
            });
        }
    },
};
