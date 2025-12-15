import wol from "wakeonlan";
import { logger } from '../config/logger';

export const sendWakeOnLan = async (macAddress: string): Promise<boolean> => {
    try {
        await wol(macAddress);
        logger.info(`Wake-on-LAN envoyé à ${macAddress}`);
        return true;
    } catch (error) {
        logger.error(error, `Erreur lors de l'envoi du Wake-on-LAN à ${macAddress}`);
        return false;
    }
};
