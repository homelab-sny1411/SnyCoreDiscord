import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types/command';
import { pingServer } from '../utils/ping';
import { sendWakeOnLan } from '../utils/wol';
import { startMinecraftServer } from '../utils/serverApi';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { createLoadingEmbed, createSuccessEmbed, createErrorEmbed, createConfigErrorEmbed } from '../utils/embeds';

export const startCommand: Command = {
    data: new SlashCommandBuilder()
        .setName(`start`)
        .setDescription(`Démarre le serveur Minecraft`),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        if (!env.minecraftServerHost || !env.minecraftServerMac) {
            const embed = createConfigErrorEmbed(`MINECRAFT_SERVER_HOST ou MINECRAFT_SERVER_MAC`);
            await interaction.editReply({ embeds: [embed] });
            return;
        }

        try {
            let embed = createLoadingEmbed(`🔍 Vérification de l'état du serveur...`);
            await interaction.editReply({ embeds: [embed] });

            const pingResult = await pingServer(env.minecraftServerHost, env.minecraftServerPort);

            if (!pingResult.online) {
                logger.info(`Serveur ${env.minecraftServerHost} hors ligne, envoi du Wake-on-LAN...`);

                embed = createLoadingEmbed(`📡 Serveur hors ligne. Envoi du Wake-on-LAN...`);
                await interaction.editReply({ embeds: [embed] });

                const wolSuccess = await sendWakeOnLan(env.minecraftServerMac);

                if (!wolSuccess) {
                    embed = createErrorEmbed(`❌ Échec du Wake-on-LAN`, `L'envoi du Wake-on-LAN a échoué.`);
                    await interaction.editReply({ embeds: [embed] });
                    return;
                }

                embed = createLoadingEmbed(
                    `⏳ Wake-on-LAN envoyé`,
                    `Attente du démarrage de la machine (${env.minecraftWolWaitTime / 1000}s)...`,
                );
                await interaction.editReply({ embeds: [embed] });

                await new Promise((resolve) => setTimeout(resolve, env.minecraftWolWaitTime));
            } else {
                logger.info(`Serveur ${env.minecraftServerHost} déjà en ligne (latence: ${pingResult.latency}ms)`);
                embed = createSuccessEmbed(
                    `✅ Serveur en ligne`,
                    `Latence: ${pingResult.latency}ms`,
                );
                await interaction.editReply({ embeds: [embed] });
            }

            embed = createLoadingEmbed(`🚀 Démarrage du serveur Minecraft...`, `Envoi de la commande via l'API...`);
            await interaction.editReply({ embeds: [embed] });

            const apiResult = await startMinecraftServer(env.minecraftServerHost, env.minecraftApiPort);

            if (apiResult.success) {
                embed = createSuccessEmbed(
                    `✅ Serveur Minecraft démarré`,
                    apiResult.message || `Le serveur a démarré avec succès.`,
                );
                await interaction.editReply({ embeds: [embed] });
            } else {
                embed = createErrorEmbed(
                    `❌ Erreur lors du démarrage`,
                    apiResult.message || `Impossible de démarrer le serveur.`,
                );
                await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            logger.error(error, `Erreur lors de l'exécution de la commande /start`);
            const embed = createErrorEmbed(
                `❌ Erreur inattendue`,
                `Une erreur s'est produite lors du démarrage.`,
            );
            await interaction.editReply({ embeds: [embed] });
        }
    },
};
