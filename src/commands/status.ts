import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types/command';
import { getMinecraftStatus } from '../utils/serverApi';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { createServerStatusEmbed, createErrorEmbed, createLoadingEmbed, createConfigErrorEmbed } from '../utils/embeds';

export const statusCommand: Command = {
    data: new SlashCommandBuilder()
        .setName(`status`)
        .setDescription(`Affiche le statut du serveur Minecraft`),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        if (!env.minecraftServerHost) {
            const embed = createConfigErrorEmbed(`MINECRAFT_SERVER_HOST`);
            await interaction.editReply({ embeds: [embed] });
            return;
        }

        try {
            const loadingEmbed = createLoadingEmbed(`🔍 Récupération du statut du serveur...`);
            await interaction.editReply({ embeds: [loadingEmbed] });

            const statusResult = await getMinecraftStatus(env.minecraftServerHost, env.minecraftApiPort);

            if (statusResult.success && statusResult.data) {
                const embed = createServerStatusEmbed(statusResult.data, statusResult.message);
                await interaction.editReply({ embeds: [embed] });
            } else {
                const embed = createErrorEmbed(
                    `❌ Impossible de récupérer le statut`,
                    statusResult.message,
                );
                await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            logger.error(error, `Erreur lors de l'exécution de la commande /status`);
            const embed = createErrorEmbed(
                `❌ Erreur inattendue`,
                `Une erreur s'est produite lors de la récupération du statut.`,
            );
            await interaction.editReply({ embeds: [embed] });
        }
    },
};
