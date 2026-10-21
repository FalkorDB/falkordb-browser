// The editor is controlled: every keystroke goes out through onChange and comes back as the
// `value` prop, which React may commit a keystroke or two late. `pending` is the queue of
// texts the editor emitted that have not come back yet, oldest first. When a prop arrives
// this says whether it is a stale echo of our own typing ("keep") or a genuinely new text
// from outside, such as history navigation ("apply").
export function reconcileEcho(pending: string[], editorText: string, value: string): "keep" | "apply" {
  const at = pending.indexOf(value);
  // Acknowledge this echo and everything emitted before it; newer entries stay pending so
  // a delayed echo of them is still recognised and cannot restore text the user deleted.
  if (at >= 0) pending.splice(0, at + 1);
  if (editorText === value || at >= 0) return "keep";
  pending.length = 0;
  return "apply";
}
