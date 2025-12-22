import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types/command';
import { restartMinecraftServer } from '../utils/serverApi';
import { env } from '../config/env';
import { logger } from '../config/logger';

export const restartCommand: Command = {
    data: new SlashCommandBuilder()
        .setName(`restart`)
        .setDescription(`Redémarre le serveur Minecraft`),

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
                content: `🔄 Redémarrage du serveur Minecraft en cours...`,
            });

            const apiResult = await restartMinecraftServer(env.minecraftServerHost, env.minecraftApiPort);

            if (apiResult.success) {
                await interaction.editReply({
                    content: `✅ Serveur Minecraft redémarré avec succès !\n${apiResult.message ? `📝 ${apiResult.message}` : ``}`,
                });
            } else {
                await interaction.editReply({
                    content: `❌ Erreur lors du redémarrage du serveur Minecraft\n${apiResult.message ? `📝 ${apiResult.message}` : ``}`,
                });
            }
        } catch (error) {
            logger.error(error, `Erreur lors de l'exécution de la commande /restart`);
            await interaction.editReply({
                content: `❌ Une erreur inattendue s'est produite`,
            });
        }
    },
};
