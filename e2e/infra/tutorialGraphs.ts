import type { Page } from "@playwright/test";
import { parseTutorialDemoOwnership, tutorialDemoOwnershipKey } from "../../lib/tutorialDemoGraphs";

// The tutorial sample graphs this page's tab created, read from its ownership
// records, so teardown can delete them when a test fails before Skip/Finish.
export async function readOwnedTutorialGraphs(page: Page): Promise<string[]> {
    const { ownerId, records } = await page.evaluate(() => {
        const ownerId = sessionStorage.getItem("tutorialDemoOwnerId");
        if (!ownerId) return { ownerId: null, records: [] };
        const suffix = `tutorialDemoGraphOwnership:${ownerId}`;
        const records = Object.keys(localStorage)
            .filter(key => key.endsWith(suffix))
            .map(key => ({ key, stored: localStorage.getItem(key) }));
        return { ownerId, records };
    });
    if (!ownerId) return [];
    const suffix = tutorialDemoOwnershipKey(ownerId);
    const names: string[] = [];
    for (const record of records) {
        if (!record.stored || !record.key.endsWith(suffix)) continue;
        const scope = record.key.slice(0, -suffix.length);
        if (!scope) throw new Error("Tutorial graph ownership has no connection scope");
        names.push(...parseTutorialDemoOwnership(record.stored, scope, ownerId).names);
    }
    return [...new Set(names)];
}
