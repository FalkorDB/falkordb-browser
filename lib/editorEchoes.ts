// The editor is controlled: every keystroke goes out through onChange and comes back as the
// `value` prop, which React may commit a keystroke or two late. `pending` is the queue of
// texts the editor emitted that have not come back yet, oldest first. When a prop arrives
// this says whether it is a stale echo of our own typing ("keep") or a genuinely new text
// from outside, such as history navigation ("apply").
// `external` is set when the parent says the value came from outside. Text alone cannot tell
// a history entry from a stale echo with the same text, so then nothing pending is trusted.
export function reconcileEcho(pending: string[], editorText: string, value: string, external = false): "keep" | "apply" {
  if (external) {
    pending.length = 0;
    return editorText === value ? "keep" : "apply";
  }
  const at = pending.indexOf(value);
  // Acknowledge this echo and everything emitted before it; newer entries stay pending so
  // a delayed echo of them is still recognised and cannot restore text the user deleted.
  if (at >= 0) pending.splice(0, at + 1);
  if (editorText === value || at >= 0) return "keep";
  pending.length = 0;
  return "apply";
}

// Echoes come back within a render or two, so only the last few emissions can still arrive.
// The cap keeps a parent that never echoes (no `value` updates) from growing the queue forever.
export const MAX_PENDING_ECHOES = 50;

export function recordEcho(pending: string[], text: string): void {
  pending.push(text);
  if (pending.length > MAX_PENDING_ECHOES) pending.shift();
}

// The shared query state carries `revision`, which advances whenever `query` is replaced from
// outside the editors: history navigation, Clear, a restored tab, an inserted AI fix. A move
// through history counts even when the entry's text is the same, since it ends the edit the
// pending echoes belong to. The
// editors pass it as `externalKey`, so such a replacement is applied even when its text
// matches a pending echo. An editor's own write sets `fromEditor`, which is never stored.
type QueryState = { query: string; counter: number; currentQuery: { text: string }; revision?: number; fromEditor?: boolean };

export function settleQueryUpdate<T extends QueryState>(prev: T, next: T): T {
  if (next === prev) return prev;
  const { fromEditor, ...rest } = next;
  const revision = prev.revision ?? 0;
  const external = !fromEditor && (next.query !== prev.query || next.counter !== prev.counter);
  return { ...rest, revision: external ? revision + 1 : revision } as T;
}

// Replaces `query`, and the draft with it when the query is the draft rather than a history entry.
export function withQuery<T extends QueryState>(prev: T, query: string): T {
  return prev.counter ? { ...prev, query } : { ...prev, query, currentQuery: { ...prev.currentQuery, text: query } };
}
