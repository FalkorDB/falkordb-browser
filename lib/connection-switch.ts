/**
 * Switching the active connection is a two-sided move: the client pins the new
 * id, and the JWT callback swaps the host/port/username that id resolves to.
 * The server refuses to move the id when it cannot resolve the record, so a
 * resolved update that still names the old connection is a *rejected* switch,
 * not a completed one. Publishing it anyway would leave the pinned id and the
 * storage prefix (built from host/port/username) describing different
 * connections, which is exactly the state every "prefix and id agree" check
 * downstream assumes cannot happen.
 *
 * So every caller goes through this helper and treats a rejection like any
 * other failure: roll the pin back.
 */

export type SessionUpdater = (data: {
  activeConnectionId?: string | null;
}) => Promise<unknown>;

export class ConnectionSwitchRejectedError extends Error {
  constructor(requested: string, adopted: string | null) {
    super(
      `Session did not adopt connection ${requested}` +
      (adopted ? ` (still on ${adopted})` : " (no active connection)")
    );
    this.name = "ConnectionSwitchRejectedError";
  }
}

/**
 * Asks the session to adopt `connId` and verifies that it did.
 *
 * @throws ConnectionSwitchRejectedError when the resolved session names a
 * different connection (or none) — the server declined the switch.
 */
export default async function switchSessionConnection(
  updateSession: SessionUpdater,
  connId: string
): Promise<void> {
  const next = await updateSession({ activeConnectionId: connId });
  const adopted =
    (next as { activeConnectionId?: string | null } | null | undefined)
      ?.activeConnectionId ?? null;
  if (adopted !== connId) {
    throw new ConnectionSwitchRejectedError(connId, adopted);
  }
}
