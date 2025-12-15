import { Socket } from 'net';

export interface PingResult {
    online: boolean;
    latency?: number;
}

export const pingServer = async (host: string, port: number, timeout = 5000): Promise<PingResult> => {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const socket = new Socket();

        const cleanup = () => {
            socket.destroy();
        };

        const timeoutHandler = setTimeout(() => {
            cleanup();
            resolve({ online: false });
        }, timeout);

        socket.on(`connect`, () => {
            clearTimeout(timeoutHandler);
            const latency = Date.now() - startTime;
            cleanup();
            resolve({ online: true, latency });
        });

        socket.on(`error`, () => {
            clearTimeout(timeoutHandler);
            cleanup();
            resolve({ online: false });
        });

        socket.connect(port, host);
    });
};
