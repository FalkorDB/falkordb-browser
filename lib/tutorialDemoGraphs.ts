// The tutorial creates its own uniquely named graphs and only ever deletes
// names it recorded as created, so a user's own graphs (e.g. "social-demo")
// are never matched, wiped or dropped by it.
export const DEMO_GRAPH_PREFIX = "tutorial-social-";
export const TUTORIAL_DEMO_OWNERSHIP_KEY_PREFIX = "tutorialDemoGraphOwnership:";
export const TUTORIAL_DEMO_OWNER_TTL_MS = 24 * 60 * 60 * 1000;

export type TutorialDemoOwnership = {
  scope: string;
  ownerId: string;
  names: string[];
  pendingNames?: string[];
  lastActiveAt?: number;
};

export function isTutorialDemoGraphName(name: unknown): name is string {
  const escapedPrefix = DEMO_GRAPH_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return typeof name === "string" && new RegExp(`^${escapedPrefix}(?:demo|test)-[a-zA-Z0-9-]+$`).test(name);
}

export function isTutorialDemoOwnerId(ownerId: string): boolean {
  return /^[a-zA-Z0-9-]+$/.test(ownerId);
}

export function tutorialDemoOwnershipKey(ownerId: string): string {
  if (!isTutorialDemoOwnerId(ownerId)) throw new Error("Tutorial graph owner ID is invalid");
  return `${TUTORIAL_DEMO_OWNERSHIP_KEY_PREFIX}${ownerId}`;
}

export function parseTutorialDemoOwnership(stored: string, scope: string, ownerId: string): TutorialDemoOwnership {
  const parsed: unknown = JSON.parse(stored);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Stored tutorial graph ownership is invalid; refusing to delete unverified graphs");
  }

  const record = parsed as Record<string, unknown>;
  const names = record.names;
  // Records written before setup completion was tracked are conservatively
  // treated as pending: an interrupted create may still finish on the server.
  const pendingNames = "pendingNames" in record ? record.pendingNames : names;
  if (
    record.scope !== scope ||
    record.ownerId !== ownerId ||
    !Array.isArray(names) ||
    !names.every(isTutorialDemoGraphName) ||
    !Array.isArray(pendingNames) ||
    !pendingNames.every(isTutorialDemoGraphName) ||
    pendingNames.some(name => !names.includes(name)) ||
    ("lastActiveAt" in record && (typeof record.lastActiveAt !== "number" || !Number.isFinite(record.lastActiveAt) || record.lastActiveAt < 0))
  ) {
    throw new Error("Stored tutorial graph ownership is invalid; refusing to delete unverified graphs");
  }

  return {
    scope,
    ownerId,
    names: [...new Set(names)],
    pendingNames: [...new Set(pendingNames)],
    ...("lastActiveAt" in record && typeof record.lastActiveAt === "number" ? { lastActiveAt: record.lastActiveAt } : {}),
  };
}

export function getTutorialDemoReclaimableNames(ownership: TutorialDemoOwnership): string[] {
  const pending = new Set(ownership.pendingNames ?? ownership.names);
  return ownership.names.filter(name => !pending.has(name));
}

export function runTutorialDemoLoadOnce<T>(
  loads: Map<string, Promise<T>>,
  key: string,
  load: () => Promise<T>,
): Promise<T> {
  const existing = loads.get(key);
  if (existing) return existing;

  const pending = Promise.resolve().then(load);
  loads.set(key, pending);
  const clear = () => {
    if (loads.get(key) === pending) loads.delete(key);
  };
  void pending.then(clear, clear);
  return pending;
}

export function isTutorialDemoOwnershipExpired(ownership: TutorialDemoOwnership, now = Date.now()): boolean {
  return ownership.lastActiveAt !== undefined && now - ownership.lastActiveAt >= TUTORIAL_DEMO_OWNER_TTL_MS;
}

// Returns a demo/test name pair that `isTaken` rejects for neither name.
export function pickTutorialDemoGraphNames(makeSuffix: () => string, isTaken: (name: string) => boolean): [string, string] {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const suffix = makeSuffix();
    const names: [string, string] = [`${DEMO_GRAPH_PREFIX}demo-${suffix}`, `${DEMO_GRAPH_PREFIX}test-${suffix}`];
    if (!names.some(isTaken)) return names;
  }
  throw new Error("Could not allocate unused tutorial graph names after 50 attempts");
}
