export interface CanvasSession {
    graph: object
    data: object
    tabId: string
    epoch: number
    restore?: object
}

const committedSessions = new WeakMap<object, CanvasSession>();

export function commitCanvasSession(canvas: object, session: CanvasSession): void {
    committedSessions.set(canvas, session);
}

/** A mounted canvas may still show the previous tab while its replacement awaits 2D. */
export function ownsCanvasSession(canvas: object, session: CanvasSession): boolean {
    const committed = committedSessions.get(canvas);
    return committed !== undefined
        && committed.graph === session.graph
        && committed.data === session.data
        && committed.tabId === session.tabId
        && committed.epoch === session.epoch
        && (!session.restore || committed.restore === session.restore);
}
