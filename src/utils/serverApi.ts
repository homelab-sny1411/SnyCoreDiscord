import axios from 'axios';
import { logger } from '../config/logger';

export interface ServerApiResponse {
    success: boolean;
    message?: string;
}

export interface MinecraftStatusData {
    serviceStatus: `running` | `stopped` | `starting` | `stopping`;
    playersOnline: number;
    maxPlayers?: number;
    version?: string;
    motd?: string;
}

export interface MinecraftStatus {
    success: boolean;
    message?: string;
    data?: MinecraftStatusData;
}

export interface AutoShutdownStatusData {
    enabled: boolean;
    idleMinutes: number;
    isIdle: boolean;
}

export interface AutoShutdownStatus {
    success: boolean;
    message?: string;
    data?: AutoShutdownStatusData;
}

export const startMinecraftServer = async (host: string, port = 1411): Promise<ServerApiResponse> => {
    try {
        const response = await axios.post(`http://${host}:${port}/minecraft/start`, {}, {
            timeout: 10000,
        });
        logger.info(`Commande de démarrage envoyée à ${host}:${port}`);
        return { success: true, message: response.data?.message };
    } catch (error) {
        logger.error(error, `Erreur lors de l'appel à l'API de démarrage sur ${host}:${port}`);
        return { success: false, message: `Erreur lors de la communication avec l'API` };
    }
};

export const stopMinecraftServer = async (host: string, port = 1411): Promise<ServerApiResponse> => {
    try {
        const response = await axios.post(`http://${host}:${port}/minecraft/stop`, {}, {
            timeout: 10000,
        });
        logger.info(`Commande d'arrêt envoyée à ${host}:${port}`);
        return { success: true, message: response.data?.message };
    } catch (error) {
        logger.error(error, `Erreur lors de l'appel à l'API d'arrêt sur ${host}:${port}`);
        return { success: false, message: `Erreur lors de la communication avec l'API` };
    }
};

export const restartMinecraftServer = async (host: string, port = 1411): Promise<ServerApiResponse> => {
    try {
        const response = await axios.post(`http://${host}:${port}/minecraft/restart`, {}, {
            timeout: 10000,
        });
        logger.info(`Commande de redémarrage envoyée à ${host}:${port}`);
        return { success: true, message: response.data?.message };
    } catch (error) {
        logger.error(error, `Erreur lors de l'appel à l'API de redémarrage sur ${host}:${port}`);
        return { success: false, message: `Erreur lors de la communication avec l'API` };
    }
};

export const getMinecraftStatus = async (host: string, port = 1411): Promise<MinecraftStatus> => {
    try {
        const response = await axios.get(`http://${host}:${port}/minecraft/status`, {
            timeout: 10000,
        });
        logger.info(`Statut du serveur récupéré depuis ${host}:${port}`);
        return {
            success: response.data?.success ?? true,
            message: response.data?.message,
            data: response.data?.data,
        };
    } catch (error) {
        logger.error(error, `Erreur lors de la récupération du statut sur ${host}:${port}`);
        return { success: false, message: `Erreur lors de la communication avec l'API` };
    }
};

export const getAutoShutdownStatus = async (host: string, port = 1411): Promise<AutoShutdownStatus> => {
    try {
        const response = await axios.get(`http://${host}:${port}/minecraft/auto-shutdown/status`, {
            timeout: 10000,
        });
        logger.info(`Statut d'auto-shutdown récupéré depuis ${host}:${port}`);
        return {
            success: response.data?.success ?? true,
            message: response.data?.message,
            data: response.data?.data,
        };
    } catch (error) {
        logger.error(error, `Erreur lors de la récupération du statut d'auto-shutdown sur ${host}:${port}`);
        return { success: false, message: `Erreur lors de la communication avec l'API` };
    }
};
