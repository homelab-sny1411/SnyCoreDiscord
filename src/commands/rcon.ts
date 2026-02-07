import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types/command';
import { sendRconCommand } from '../utils/serverApi';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { createLoadingEmbed, createErrorEmbed, createRconEmbed, createConfigErrorEmbed } from '../utils/embeds';

/**
 * Commande Discord pour envoyer une commande RCON au serveur Minecraft
 * Permet d'exécuter des commandes administratives à distance sur le serveur
 */
export const rconCommand: Command = {
    data: new SlashCommandBuilder()
        .setName(`rcon`)
        .setDescription(`Envoie une commande RCON au serveur Minecraft`)
        .addStringOption((option) =>
            option
                .setName(`commande`)
                .setDescription(`La commande à exécuter sur le serveur`)
                .setRequired(true),
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        if (!env.minecraftServerHost) {
            const embed = createConfigErrorEmbed(`MINECRAFT_SERVER_HOST`);
            await interaction.editReply({ embeds: [embed] });
            return;
        }

        try {
            const command = interaction.options.getString(`commande`, true);

            let embed = createLoadingEmbed(`🔍 Envoi de la commande RCON...`, `\`${command}\``);
            await interaction.editReply({ embeds: [embed] });

            const result = await sendRconCommand(env.minecraftServerHost, command, env.minecraftApiPort);

            if (result.success && result.data) {
                embed = createRconEmbed(
                    result.data.command,
                    result.data.response || `Aucune réponse`,
                    result.message,
                );
                await interaction.editReply({ embeds: [embed] });
            } else {
                embed = createErrorEmbed(
                    `❌ Échec de l'exécution`,
                    result.message || `Impossible d'exécuter la commande RCON.`,
                );
                await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            logger.error(error, `Erreur lors de l'exécution de la commande /rcon`);
            const embed = createErrorEmbed(
                `❌ Erreur inattendue`,
                `Une erreur s'est produite lors de l'exécution de la commande.`,
            );
            await interaction.editReply({ embeds: [embed] });
        }
    },
};
