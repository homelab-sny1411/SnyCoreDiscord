declare module 'wakeonlan' {
    function wol(macAddress: string): Promise<void>;
    export = wol;
}
