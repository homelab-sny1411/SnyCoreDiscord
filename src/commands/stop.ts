import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types/command';
import { stopMinecraftServer } from '../utils/serverApi';
import { env } from '../config/env';
import { logger } from '../config/logger';

export const stopCommand: Command = {
    data: new SlashCommandBuilder()
        .setName(`stop`)
        .setDescription(`Arrête le serveur Minecraft`),

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
                content: `🛑 Arrêt du serveur Minecraft en cours...`,
            });

            const apiResult = await stopMinecraftServer(env.minecraftServerHost, env.minecraftApiPort);

            if (apiResult.success) {
                await interaction.editReply({
                    content: `✅ Serveur Minecraft arrêté avec succès !\n${apiResult.message ? `📝 ${apiResult.message}` : ``}`,
                });
            } else {
                await interaction.editReply({
                    content: `❌ Erreur lors de l'arrêt du serveur Minecraft\n${apiResult.message ? `📝 ${apiResult.message}` : ``}`,
                });
            }
        } catch (error) {
            logger.error(error, `Erreur lors de l'exécution de la commande /stop`);
            await interaction.editReply({
                content: `❌ Une erreur inattendue s'est produite`,
            });
        }
    },
};
