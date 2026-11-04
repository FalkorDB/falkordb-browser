type TimeoutSession = {
    expires?: string;
    user?: {
        id?: string;
        host?: string;
        port?: number;
        username?: string;
    } | null;
} | null;

export function timeoutInitializationKey(
    status: string,
    prefixReady: boolean,
    session: TimeoutSession,
    prefixConnectionId: string | null,
): string | null {
    if (status !== "authenticated" || !prefixReady) return null;

    return JSON.stringify([
        session?.user?.id ?? null,
        session?.user?.host ?? null,
        session?.user?.port ?? null,
        session?.user?.username ?? null,
        prefixConnectionId,
    ]);
}

export function isTimeoutInitializationReady(
    currentKey: string | null,
    loadedKey: string | null,
): boolean {
    return currentKey !== null && currentKey === loadedKey;
}
