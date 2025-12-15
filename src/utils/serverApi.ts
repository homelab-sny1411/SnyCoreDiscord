import axios from 'axios';
import { logger } from '../config/logger';

export interface ServerApiResponse {
    success: boolean;
    message?: string;
}

export const startMinecraftServer = async (host: string, port = 1411): Promise<ServerApiResponse> => {
    try {
        const response = await axios.post(`http://${host}:${port}/start`, {}, {
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
        const response = await axios.post(`http://${host}:${port}/stop`, {}, {
            timeout: 10000,
        });
        logger.info(`Commande d'arrêt envoyée à ${host}:${port}`);
        return { success: true, message: response.data?.message };
    } catch (error) {
        logger.error(error, `Erreur lors de l'appel à l'API d'arrêt sur ${host}:${port}`);
        return { success: false, message: `Erreur lors de la communication avec l'API` };
    }
};
