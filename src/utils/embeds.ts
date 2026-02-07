import { EmbedBuilder } from 'discord.js';
import { MinecraftStatusData, AutoShutdownStatusData } from './serverApi';

// Palette de couleurs cohérente
const COLORS = {
	SUCCESS: 0x2ecc71,    // Vert
	ERROR: 0xe74c3c,      // Rouge
	INFO: 0x3498db,       // Bleu
	WARNING: 0xf39c12,    // Orange
	NEUTRAL: 0x95a5a6,    // Gris
} as const;

// Fonction de base pour créer un embed avec style
function createBaseEmbed(title: string, color: number, description?: string): EmbedBuilder {
	const embed = new EmbedBuilder()
		.setTitle(title)
		.setColor(color)
		.setTimestamp();

	if (description) {
		embed.setDescription(description);
	}

	return embed;
}

/**
 * Crée un embed de succès (vert)
 */
export function createSuccessEmbed(title: string, description?: string): EmbedBuilder {
	return createBaseEmbed(title, COLORS.SUCCESS, description);
}

/**
 * Crée un embed d'erreur (rouge)
 */
export function createErrorEmbed(title: string, description?: string): EmbedBuilder {
	return createBaseEmbed(title, COLORS.ERROR, description);
}

/**
 * Crée un embed d'information (bleu)
 */
export function createInfoEmbed(title: string, description?: string): EmbedBuilder {
	return createBaseEmbed(title, COLORS.INFO, description);
}

/**
 * Crée un embed de chargement/progression (bleu, sans timestamp)
 */
export function createLoadingEmbed(title: string, description?: string): EmbedBuilder {
	const embed = new EmbedBuilder()
		.setTitle(title)
		.setColor(COLORS.INFO);

	if (description) {
		embed.setDescription(description);
	}

	return embed;
}

/**
 * Crée un embed d'avertissement (orange)
 */
export function createWarningEmbed(title: string, description?: string): EmbedBuilder {
	return createBaseEmbed(title, COLORS.WARNING, description);
}

/**
 * Crée un embed dynamique pour le statut du serveur Minecraft
 * La couleur change en fonction du statut
 */
export function createServerStatusEmbed(data: MinecraftStatusData, apiMessage?: string): EmbedBuilder {
	// Déterminer la couleur et l'émoji basé sur le statut
	const statusMap: Record<typeof data.serviceStatus, { color: number; emoji: string }> = {
		running: { color: COLORS.SUCCESS, emoji: `🟢` },
		stopped: { color: COLORS.ERROR, emoji: `🔴` },
		starting: { color: COLORS.WARNING, emoji: `🟡` },
		stopping: { color: COLORS.WARNING, emoji: `🟠` },
	};

	const statusInfo = statusMap[data.serviceStatus] || { color: COLORS.NEUTRAL, emoji: `⚪` };
	const color = statusInfo.color;
	const statusEmoji = statusInfo.emoji;

	const embed = new EmbedBuilder()
		.setTitle(`${statusEmoji} Statut du serveur`)
		.setColor(color)
		.setTimestamp();

	// Ajouter les champs
	embed.addFields(
		{
			name: `Statut`,
			value: data.serviceStatus.charAt(0).toUpperCase() + data.serviceStatus.slice(1),
			inline: true,
		},
		{
			name: `👥 Joueurs`,
			value: `${data.playersOnline}${data.maxPlayers ? `/${data.maxPlayers}` : ``}`,
			inline: true,
		},
	);

	// Ajouter la version si disponible
	if (data.version) {
		embed.addFields({
			name: `📦 Version`,
			value: data.version,
			inline: true,
		});
	}

	// Ajouter le MOTD si disponible
	if (data.motd) {
		embed.addFields({
			name: `💬 MOTD`,
			value: data.motd,
			inline: false,
		});
	}

	// Ajouter le message API en footer si disponible
	if (apiMessage) {
		embed.setFooter({ text: apiMessage });
	}

	return embed;
}

/**
 * Crée un embed pour l'auto-shutdown
 */
export function createAutoShutdownEmbed(data: AutoShutdownStatusData, apiMessage?: string): EmbedBuilder {
	const color = data.enabled ? COLORS.SUCCESS : COLORS.ERROR;
	const statusEmoji = data.enabled ? `✅` : `❌`;
	const statusText = data.enabled ? `Activé` : `Désactivé`;

	const embed = new EmbedBuilder()
		.setTitle(`⏱️ Auto-Shutdown`)
		.setColor(color)
		.setTimestamp()
		.addFields({
			name: `Statut`,
			value: `${statusEmoji} ${statusText}`,
			inline: true,
		});

	// Ajouter les détails si activé
	if (data.enabled) {
		const idleEmoji = data.isIdle ? `💤` : `⚡`;
		const idleText = data.isIdle ? `Inactif` : `Actif`;

		embed.addFields(
			{
				name: `⏱️ Délai d'inactivité`,
				value: `${data.idleMinutes} minutes`,
				inline: true,
			},
			{
				name: `État`,
				value: `${idleEmoji} ${idleText}`,
				inline: true,
			},
		);
	}

	// Ajouter le message API en footer si disponible
	if (apiMessage) {
		embed.setFooter({ text: apiMessage });
	}

	return embed;
}

/**
 * Crée un embed pour un résultat de commande RCON
 */
export function createRconEmbed(command: string, response: string, apiMessage?: string): EmbedBuilder {
	const embed = new EmbedBuilder()
		.setTitle(`✅ Commande RCON exécutée`)
		.setColor(COLORS.SUCCESS)
		.setTimestamp()
		.addFields(
			{
				name: `Commande`,
				value: `\`${command}\``,
				inline: false,
			},
			{
				name: `Réponse`,
				value: response ? `\`\`\`\n${response}\n\`\`\`` : `Aucune réponse`,
				inline: false,
			},
		);

	// Ajouter le message API en footer si disponible
	if (apiMessage) {
		embed.setFooter({ text: apiMessage });
	}

	return embed;
}

/**
 * Crée un embed de configuration manquante (erreur)
 */
export function createConfigErrorEmbed(variable: string): EmbedBuilder {
	return createErrorEmbed(
		`❌ Configuration manquante`,
		`Variable d'environnement manquante: \`${variable}\``,
	);
}
