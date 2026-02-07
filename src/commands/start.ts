import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types/command';
import { pingServer } from '../utils/ping';
import { sendWakeOnLan } from '../utils/wol';
import { startMinecraftServer } from '../utils/serverApi';
import { env } from '../config/env';
import { logger } from '../config/logger';

export const startCommand: Command = {
    data: new SlashCommandBuilder()
        .setName(`start`)
        .setDescription(`Démarre le serveur Minecraft`),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        if (!env.minecraftServerHost || !env.minecraftServerMac) {
            await interaction.editReply({
                content: `❌ Configuration manquante (MINECRAFT_SERVER_HOST ou MINECRAFT_SERVER_MAC)`,
            });
            return;
        }

        try {
            await interaction.editReply({
                content: `🔍 Vérification de l'état du serveur...`,
            });

            const pingResult = await pingServer(env.minecraftServerHost, env.minecraftServerPort);

            if (!pingResult.online) {
                logger.info(`Serveur ${env.minecraftServerHost} hors ligne, envoi du Wake-on-LAN...`);

                await interaction.editReply({
                    content: `📡 Serveur hors ligne. Envoi du Wake-on-LAN...`,
                });

                const wolSuccess = await sendWakeOnLan(env.minecraftServerMac);

                if (!wolSuccess) {
                    await interaction.editReply({
                        content: `❌ Échec de l'envoi du Wake-on-LAN`,
                    });
                    return;
                }

                await interaction.editReply({
                    content: `⏳ Wake-on-LAN envoyé ! Attente du démarrage de la machine (${env.minecraftWolWaitTime / 1000}s)...`,
                });

                await new Promise((resolve) => setTimeout(resolve, env.minecraftWolWaitTime));
            } else {
                logger.info(`Serveur ${env.minecraftServerHost} déjà en ligne (latence: ${pingResult.latency}ms)`);
                await interaction.editReply({
                    content: `✅ Serveur en ligne (latence: ${pingResult.latency}ms)`,
                });
            }

            await interaction.editReply({
                content: `🚀 Démarrage du serveur Minecraft via l'API...`,
            });

            const apiResult = await startMinecraftServer(env.minecraftServerHost, env.minecraftApiPort);

            if (apiResult.success) {
                await interaction.editReply({
                    content: `✅ Serveur Minecraft démarré avec succès !\n${apiResult.message ? `📝 ${apiResult.message}` : ``}`,
                });
            } else {
                await interaction.editReply({
                    content: `❌ Erreur lors du démarrage du serveur Minecraft\n${apiResult.message ? `📝 ${apiResult.message}` : ``}`,
                });
            }
        } catch (error) {
            logger.error(error, `Erreur lors de l'exécution de la commande /start`);
            await interaction.editReply({
                content: `❌ Une erreur inattendue s'est produite`,
            });
        }
    },
};
