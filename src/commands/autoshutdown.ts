import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types/command';
import { getAutoShutdownStatus, setAutoShutdown } from '../utils/serverApi';
import { env } from '../config/env';
import { logger } from '../config/logger';

export const autoshutdownCommand: Command = {
    data: new SlashCommandBuilder()
        .setName(`autoshutdown`)
        .setDescription(`Gérer l'autoshutdown du serveur Minecraft`)
        .addStringOption((option) =>
            option
                .setName(`action`)
                .setDescription(`Action à effectuer`)
                .setRequired(true)
                .addChoices(
                    { name: `Activer`, value: `enable` },
                    { name: `Désactiver`, value: `disable` },
                    { name: `Statut`, value: `status` },
                ),
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        if (!env.minecraftServerHost) {
            await interaction.editReply({
                content: `❌ Configuration manquante (MINECRAFT_SERVER_HOST)`,
            });
            return;
        }

        const action = interaction.options.getString(`action`, true);

        try {
            switch (action) {
                case `enable`: {
                    const result = await setAutoShutdown(env.minecraftServerHost, true, env.minecraftApiPort);
                    if (result.success) {
                        await interaction.editReply({ content: `✅ Autoshutdown **activé**` });
                        logger.info({ user: interaction.user.tag }, `Autoshutdown activé`);
                    } else {
                        await interaction.editReply({
                            content: `❌ Impossible d'activer l'autoshutdown\n${result.message ? `📝 ${result.message}` : ``}`,
                        });
                    }
                    break;
                }
                case `disable`: {
                    const result = await setAutoShutdown(env.minecraftServerHost, false, env.minecraftApiPort);
                    if (result.success) {
                        await interaction.editReply({ content: `✅ Autoshutdown **désactivé**` });
                        logger.info({ user: interaction.user.tag }, `Autoshutdown désactivé`);
                    } else {
                        await interaction.editReply({
                            content: `❌ Impossible de désactiver l'autoshutdown\n${result.message ? `📝 ${result.message}` : ``}`,
                        });
                    }
                    break;
                }
                case `status`: {
                    const statusResult = await getAutoShutdownStatus(env.minecraftServerHost, env.minecraftApiPort);

                    if (statusResult.success && statusResult.data) {
                        const enabledEmoji = statusResult.data.enabled ? `✅` : `❌`;
                        const enabledText = statusResult.data.enabled ? `Activé` : `Désactivé`;

                        let response = `${enabledEmoji} **Auto-shutdown:** ${enabledText}`;

                        if (statusResult.data.enabled) {
                            response += `\n⏱️ **Délai d'inactivité:** ${statusResult.data.idleMinutes} minutes`;
                            const idleEmoji = statusResult.data.isIdle ? `💤` : `⚡`;
                            const idleText = statusResult.data.isIdle ? `Inactif` : `Actif`;
                            response += `\n${idleEmoji} **État:** ${idleText}`;
                        }

                        if (statusResult.message) {
                            response += `\n📝 ${statusResult.message}`;
                        }

                        await interaction.editReply({ content: response });
                    } else {
                        await interaction.editReply({
                            content: `❌ Impossible de récupérer le statut\n${statusResult.message ? `📝 ${statusResult.message}` : ``}`,
                        });
                    }
                    break;
                }
            }
        } catch (error) {
            logger.error(error, `Erreur lors de l'exécution de la commande /autoshutdown`);
            await interaction.editReply({
                content: `❌ Une erreur inattendue s'est produite`,
            });
        }
    },
};
