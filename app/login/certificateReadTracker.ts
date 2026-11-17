export type CertificateSlot = "ca" | "cert" | "key";

/**
 * Tracks in-flight certificate reads per slot so a superseded read's callback
 * can be ignored and submission can wait for the current reads.
 */
export function createCertificateReadTracker() {
    const versions: Record<CertificateSlot, number> = { ca: 0, cert: 0, key: 0 };
    const pending = new Set<CertificateSlot>();

    return {
        start(slot: CertificateSlot): number {
            pending.add(slot);
            versions[slot] += 1;
            return versions[slot];
        },
        /** Returns false (and changes nothing) when a newer read or `invalidateAll` superseded this one. */
        finish(slot: CertificateSlot, version: number): boolean {
            if (version !== versions[slot]) return false;
            pending.delete(slot);
            return true;
        },
        invalidateAll(): void {
            versions.ca += 1;
            versions.cert += 1;
            versions.key += 1;
            pending.clear();
        },
        hasPending(): boolean {
            return pending.size > 0;
        },
    };
}
