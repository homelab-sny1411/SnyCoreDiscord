import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types/command';
import { getAutoShutdownStatus, setAutoShutdown } from '../utils/serverApi';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { createSuccessEmbed, createErrorEmbed, createAutoShutdownEmbed, createConfigErrorEmbed } from '../utils/embeds';

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
            const embed = createConfigErrorEmbed(`MINECRAFT_SERVER_HOST`);
            await interaction.editReply({ embeds: [embed] });
            return;
        }

        const action = interaction.options.getString(`action`, true);

        try {
            switch (action) {
                case `enable`: {
                    const result = await setAutoShutdown(env.minecraftServerHost, true, env.minecraftApiPort);
                    if (result.success) {
                        const embed = createSuccessEmbed(
                            `✅ Auto-shutdown activé`,
                            result.message || `L'auto-shutdown a été activé.`,
                        );
                        await interaction.editReply({ embeds: [embed] });
                        logger.info({ user: interaction.user.tag }, `Autoshutdown activé`);
                    } else {
                        const embed = createErrorEmbed(
                            `❌ Impossible d'activer`,
                            result.message || `Impossible d'activer l'auto-shutdown.`,
                        );
                        await interaction.editReply({ embeds: [embed] });
                    }
                    break;
                }
                case `disable`: {
                    const result = await setAutoShutdown(env.minecraftServerHost, false, env.minecraftApiPort);
                    if (result.success) {
                        const embed = createSuccessEmbed(
                            `✅ Auto-shutdown désactivé`,
                            result.message || `L'auto-shutdown a été désactivé.`,
                        );
                        await interaction.editReply({ embeds: [embed] });
                        logger.info({ user: interaction.user.tag }, `Autoshutdown désactivé`);
                    } else {
                        const embed = createErrorEmbed(
                            `❌ Impossible de désactiver`,
                            result.message || `Impossible de désactiver l'auto-shutdown.`,
                        );
                        await interaction.editReply({ embeds: [embed] });
                    }
                    break;
                }
                case `status`: {
                    const statusResult = await getAutoShutdownStatus(env.minecraftServerHost, env.minecraftApiPort);

                    if (statusResult.success && statusResult.data) {
                        const embed = createAutoShutdownEmbed(statusResult.data, statusResult.message);
                        await interaction.editReply({ embeds: [embed] });
                    } else {
                        const embed = createErrorEmbed(
                            `❌ Impossible de récupérer le statut`,
                            statusResult.message || `Erreur lors de la récupération du statut.`,
                        );
                        await interaction.editReply({ embeds: [embed] });
                    }
                    break;
                }
            }
        } catch (error) {
            logger.error(error, `Erreur lors de l'exécution de la commande /autoshutdown`);
            const embed = createErrorEmbed(
                `❌ Erreur inattendue`,
                `Une erreur s'est produite lors de l'exécution de la commande.`,
            );
            await interaction.editReply({ embeds: [embed] });
        }
    },
};
