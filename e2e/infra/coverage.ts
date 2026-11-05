// Browser-side code coverage for the e2e suite. When E2E_COVERAGE_DIR is set,
// every Chromium page records V8 JavaScript coverage, saved to that dir when
// the page or its context closes; .github/scripts/coverage-report.mjs maps it
// back to the sources through the build's source maps. Firefox has no
// coverage API, so its pages run unrecorded.
//
// Pages come from three places, and each one is tracked:
// - BrowserWrapper calls trackContext() on the context it creates.
// - Specs that use Playwright's `page`, `context` or `browser` fixtures import
//   `test` from here: its `browser` tracks every context made from it.
// - Anything else calls trackContext() on the context it creates.

import { test as base, type BrowserContext, type Page } from '@playwright/test';
import { createHash, randomUUID } from 'crypto';
import { linkSync, mkdirSync, renameSync, unlinkSync, writeFileSync } from 'fs';
import path from 'path';

const dir = process.env.E2E_COVERAGE_DIR;

const recording = new Map<Page, Promise<void>>();

// The chunk URLs whose source this worker has saved.
const savedSources = new Set<string>();
const trackedContexts = new WeakSet<BrowserContext>();

function recordFailure(error: unknown) {
    console.error("Browser coverage collection failed:", error);
    if (!dir) throw new Error("Coverage directory is not configured");
    mkdirSync(dir, { recursive: true });
    writeWhole(path.join(dir, `browser-error-${randomUUID()}.json`), JSON.stringify({
        message: error instanceof Error ? error.message : String(error),
    }));
}

/**
 * Writes `data` whole under a temporary name and only then gives it its real
 * one, so the report never reads a file a crashed write left half done.
 */
function writeWhole(file: string, data: string) {
    const tmp = `${file}.${randomUUID()}.tmp`;
    writeFileSync(tmp, data);
    renameSync(tmp, file);
}

/** Stops recording `page` and saves its coverage of the app's chunks. */
async function save(page: Page) {
    const started = recording.get(page);
    if (!started || page.isClosed()) return;
    recording.delete(page);
    await started;
    const entries = (await page.coverage.stopJSCoverage())
        .filter(({ url }) => url.includes('/_next/static/'));
    if (!dir || !entries.length) return;
    mkdirSync(dir, { recursive: true });
    // The chunks are content-hashed, so a URL always serves the same source:
    // save each source once, not once per page. Linking the complete file into
    // place fails if another worker already saved it, and never replaces it.
    for (const { url, source } of entries) {
        if (source === undefined || savedSources.has(url)) continue;
        const file = path.join(dir, `browser-source-${createHash('sha1').update(url).digest('hex')}.js`);
        const tmp = `${file}.${randomUUID()}.tmp`;
        writeFileSync(tmp, source);
        try {
            linkSync(tmp, file);
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
        } finally {
            unlinkSync(tmp);
        }
        savedSources.add(url);
    }
    const data = entries.map(({ url, scriptId, functions }) => ({ url, scriptId, functions }));
    writeWhole(path.join(dir, `browser-${randomUUID()}.json`), JSON.stringify(data));
}

/** Records `page`'s coverage until it closes (or its context does). */
function track(page: Page) {
    if (recording.has(page)) return;
    recording.set(page, page.coverage.startJSCoverage({ resetOnNavigation: false }).catch(recordFailure));
    const close = page.close.bind(page);
    page.close = async (options) => {
        try {
            await save(page);
        } catch (error) {
            recordFailure(error);
        } finally {
            await close(options);
        }
    };
}

/** Records coverage for every page opened in `context`. A no-op unless collecting. */
export function trackContext<T extends BrowserContext>(context: T): T {
    if (!dir || context.browser()?.browserType().name() !== 'chromium') return context;
    if (trackedContexts.has(context)) return context;
    trackedContexts.add(context);
    context.pages().forEach(track);
    context.on('page', track);
    // A page the test opens is recording before the test can navigate it.
    // (Pages the app opens itself, like popups, start recording a moment late.)
    const newPage = context.newPage.bind(context);
    context.newPage = async () => {
        const page = await newPage();
        track(page);
        await recording.get(page);
        return page;
    };
    const close = context.close.bind(context);
    context.close = async (options) => {
        try {
            await Promise.all(context.pages().map((page) => save(page).catch(recordFailure)));
        } finally {
            await close(options);
        }
    };
    return context;
}

/** Playwright's `test`, with every context made from the `browser` fixture tracked. */
export const test = base.extend({
    browser: [async ({ browser }, use) => {
        const newContext = browser.newContext.bind(browser);
        browser.newContext = async (options) => trackContext(await newContext(options));
        await use(browser);
    }, { scope: 'worker' }],
});

export { expect } from '@playwright/test';
