import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types/command';
import { stopMinecraftServer } from '../utils/serverApi';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { createLoadingEmbed, createSuccessEmbed, createErrorEmbed, createConfigErrorEmbed } from '../utils/embeds';

export const stopCommand: Command = {
    data: new SlashCommandBuilder()
        .setName(`stop`)
        .setDescription(`Arrête le serveur Minecraft`),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        if (!env.minecraftServerHost) {
            const embed = createConfigErrorEmbed(`MINECRAFT_SERVER_HOST`);
            await interaction.editReply({ embeds: [embed] });
            return;
        }

        try {
            let embed = createLoadingEmbed(`🛑 Arrêt du serveur Minecraft...`);
            await interaction.editReply({ embeds: [embed] });

            const apiResult = await stopMinecraftServer(env.minecraftServerHost, env.minecraftApiPort);

            if (apiResult.success) {
                embed = createSuccessEmbed(
                    `✅ Serveur arrêté`,
                    apiResult.message || `Le serveur a été arrêté avec succès.`,
                );
                await interaction.editReply({ embeds: [embed] });
            } else {
                embed = createErrorEmbed(
                    `❌ Erreur lors de l'arrêt`,
                    apiResult.message || `Impossible d'arrêter le serveur.`,
                );
                await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            logger.error(error, `Erreur lors de l'exécution de la commande /stop`);
            const embed = createErrorEmbed(
                `❌ Erreur inattendue`,
                `Une erreur s'est produite lors de l'arrêt.`,
            );
            await interaction.editReply({ embeds: [embed] });
        }
    },
};
