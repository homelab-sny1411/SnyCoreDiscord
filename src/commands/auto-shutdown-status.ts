import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types/command';
import { getAutoShutdownStatus } from '../utils/serverApi';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { createLoadingEmbed, createErrorEmbed, createAutoShutdownEmbed, createConfigErrorEmbed } from '../utils/embeds';

export const autoShutdownStatusCommand: Command = {
    data: new SlashCommandBuilder()
        .setName(`auto-shutdown-status`)
        .setDescription(`Affiche le statut du service d'extinction automatique du serveur`),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        if (!env.minecraftServerHost) {
            const embed = createConfigErrorEmbed(`MINECRAFT_SERVER_HOST`);
            await interaction.editReply({ embeds: [embed] });
            return;
        }

        try {
            const loadingEmbed = createLoadingEmbed(`🔍 Récupération du statut de l'auto-shutdown...`);
            await interaction.editReply({ embeds: [loadingEmbed] });

            const statusResult = await getAutoShutdownStatus(env.minecraftServerHost, env.minecraftApiPort);

            if (statusResult.success && statusResult.data) {
                const embed = createAutoShutdownEmbed(statusResult.data, statusResult.message);
                await interaction.editReply({ embeds: [embed] });
            } else {
                const embed = createErrorEmbed(
                    `❌ Impossible de récupérer le statut`,
                    statusResult.message || `Erreur lors de la récupération du statut de l'auto-shutdown.`,
                );
                await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            logger.error(error, `Erreur lors de l'exécution de la commande /auto-shutdown-status`);
            const embed = createErrorEmbed(
                `❌ Erreur inattendue`,
                `Une erreur s'est produite lors de l'exécution de la commande.`,
            );
            await interaction.editReply({ embeds: [embed] });
        }
    },
};
