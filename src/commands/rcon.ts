import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types/command';
import { sendRconCommand } from '../utils/serverApi';
import { env } from '../config/env';
import { logger } from '../config/logger';

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
            await interaction.editReply({
                content: `❌ Configuration manquante (MINECRAFT_SERVER_HOST)`,
            });
            return;
        }

        try {
            const command = interaction.options.getString(`commande`, true);

            await interaction.editReply({
                content: `🔍 Envoi de la commande RCON: \`${command}\`...`,
            });

            const result = await sendRconCommand(env.minecraftServerHost, command, env.minecraftApiPort);

            if (result.success && result.data) {
                await interaction.editReply({
                    content: `✅ Commande exécutée avec succès !\n\n**Commande:** \`${result.data.command}\`\n**Réponse:**\n\`\`\`\n${result.data.response || `Aucune réponse`}\n\`\`\``,
                });
            } else {
                await interaction.editReply({
                    content: `❌ Échec de l'exécution de la commande RCON\n${result.message ? `📝 ${result.message}` : ``}`,
                });
            }
        } catch (error) {
            logger.error(error, `Erreur lors de l'exécution de la commande /rcon`);
            await interaction.editReply({
                content: `❌ Une erreur inattendue s'est produite`,
            });
        }
    },
};
