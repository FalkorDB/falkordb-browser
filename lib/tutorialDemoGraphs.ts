// The tutorial creates its own uniquely named graphs and only ever deletes
// names it recorded as created, so a user's own graphs (e.g. "social-demo")
// are never matched, wiped or dropped by it.
export const DEMO_GRAPH_PREFIX = "tutorial-social-";
export const TUTORIAL_DEMO_OWNERSHIP_KEY_PREFIX = "tutorialDemoGraphOwnership:";

export type TutorialDemoOwnership = { scope: string; ownerId: string; names: string[] };

export function isTutorialDemoGraphName(name: unknown): name is string {
  return typeof name === "string" && /^tutorial-social-(?:demo|test)-[a-zA-Z0-9-]+$/.test(name);
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
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("scope" in parsed) ||
    parsed.scope !== scope ||
    !("ownerId" in parsed) ||
    parsed.ownerId !== ownerId ||
    !("names" in parsed) ||
    !Array.isArray(parsed.names) ||
    !parsed.names.every(isTutorialDemoGraphName)
  ) {
    throw new Error("Stored tutorial graph ownership is invalid; refusing to delete unverified graphs");
  }

  return { scope, ownerId, names: [...new Set(parsed.names)] };
}

// Returns a demo/test name pair that `isTaken` rejects for neither name.
export function pickTutorialDemoGraphNames(makeSuffix: () => string, isTaken: (name: string) => boolean): [string, string] {
  for (;;) {
    const suffix = makeSuffix();
    const names: [string, string] = [`${DEMO_GRAPH_PREFIX}demo-${suffix}`, `${DEMO_GRAPH_PREFIX}test-${suffix}`];
    if (!names.some(isTaken)) return names;
  }
}
