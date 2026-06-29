// Tiny clipboard helper. The actual writer (e.g. navigator.clipboard.writeText) is
// injected by the caller so this module has no DOM/`navigator` dependency — it stays
// import-safe under `node --test` and trivially unit-testable. It never throws: callers
// get a boolean and can show success/failure feedback.
export async function copyText(
  writer: ((text: string) => Promise<void>) | undefined,
  text: string
): Promise<boolean> {
  if (!writer) return false;
  try {
    await writer(text);
    return true;
  } catch {
    return false;
  }
}
