export async function closeBrowserThenCleanup(
    closeBrowser: () => Promise<void>,
    cleanup: () => Promise<void>,
): Promise<void> {
    try {
        await closeBrowser();
    } finally {
        await cleanup();
    }
}
