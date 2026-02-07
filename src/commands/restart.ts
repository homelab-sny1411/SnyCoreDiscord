import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types/command';
import { restartMinecraftServer } from '../utils/serverApi';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { createLoadingEmbed, createSuccessEmbed, createErrorEmbed, createConfigErrorEmbed } from '../utils/embeds';

export const restartCommand: Command = {
    data: new SlashCommandBuilder()
        .setName(`restart`)
        .setDescription(`Redémarre le serveur Minecraft`),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        if (!env.minecraftServerHost) {
            const embed = createConfigErrorEmbed(`MINECRAFT_SERVER_HOST`);
            await interaction.editReply({ embeds: [embed] });
            return;
        }

        try {
            let embed = createLoadingEmbed(`🔄 Redémarrage du serveur Minecraft...`);
            await interaction.editReply({ embeds: [embed] });

            const apiResult = await restartMinecraftServer(env.minecraftServerHost, env.minecraftApiPort);

            if (apiResult.success) {
                embed = createSuccessEmbed(
                    `✅ Serveur redémarré`,
                    apiResult.message || `Le serveur a été redémarré avec succès.`,
                );
                await interaction.editReply({ embeds: [embed] });
            } else {
                embed = createErrorEmbed(
                    `❌ Erreur lors du redémarrage`,
                    apiResult.message || `Impossible de redémarrer le serveur.`,
                );
                await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            logger.error(error, `Erreur lors de l'exécution de la commande /restart`);
            const embed = createErrorEmbed(
                `❌ Erreur inattendue`,
                `Une erreur s'est produite lors du redémarrage.`,
            );
            await interaction.editReply({ embeds: [embed] });
        }
    },
};
