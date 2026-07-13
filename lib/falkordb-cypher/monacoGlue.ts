// ---------------------------------------------------------------------------
// falkordb-cypher — Monaco glue (the ONLY module that imports Monaco)
// ---------------------------------------------------------------------------
// Bridges the pure engine to the existing editor plumbing WITHOUT changing any
// UI/visual behavior:
//
//   • toCompletionItems() maps engine candidates → the exact Monaco
//     CompletionItem shape the current `getSuggestions` contract returns, using
//     the same "(keyword)"/"(procedure)"/… detail tags the UI already styles.
//   • attachRealtimeLinting() wires the engine into Monaco's input stream via
//     `onDidChangeModelContent`, pushes red squigglies with
//     `setModelMarkers`, and flips an `isQueryValid` flag to gate execution.
//
// Because the visual layer (popup, marker owner, code-action provider) is left
// untouched, this drops straight into `registerCompletionItemProvider` and the
// existing marker system.
// ---------------------------------------------------------------------------

import type { Monaco } from "@monaco-editor/react";
import type * as monaco from "monaco-editor";
import type { FalkorCandidate } from "./falkordbSpec.ts";
import type { FalkorCypherEngine } from "./engine.ts";

// Distinct marker owner so real-time (on-input) syntax squigglies never clobber
// the existing backend-diagnostics markers ("cypher-diagnostics"). Both layers
// coexist; this one is the sole source of live syntax errors.
export const FALKOR_MARKER_OWNER = "falkordb-cypher-syntax";

const KIND_MAP: Record<FalkorCandidate["kind"], (m: Monaco) => monaco.languages.CompletionItemKind> = {
  keyword: (m) => m.languages.CompletionItemKind.Keyword,
  function: (m) => m.languages.CompletionItemKind.Function,
  procedure: (m) => m.languages.CompletionItemKind.Function,
  algorithm: (m) => m.languages.CompletionItemKind.Function,
  label: (m) => m.languages.CompletionItemKind.Class,
  relationshipType: (m) => m.languages.CompletionItemKind.Interface,
  propertyKey: (m) => m.languages.CompletionItemKind.Property,
  variable: (m) => m.languages.CompletionItemKind.Variable,
  parameter: (m) => m.languages.CompletionItemKind.TypeParameter,
  namespace: (m) => m.languages.CompletionItemKind.Module,
};

/**
 * Map engine candidates to Monaco completion items. `range` is left for the
 * host EditorComponent to overwrite (its contract already does this), matching
 * the existing `getSuggestions` behavior.
 */
export function toCompletionItems(
  monacoInstance: Monaco,
  candidates: FalkorCandidate[]
): (Omit<monaco.languages.CompletionItem, "range"> & { range?: monaco.languages.CompletionItem["range"] })[] {
  return candidates.map((c) => ({
    label: c.label,
    insertText: c.insertText,
    insertTextRules: c.isSnippet
      ? monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet
      : undefined,
    kind: KIND_MAP[c.kind](monacoInstance),
    detail: c.detail,
  }));
}

/**
 * A ready-made `getSuggestions` implementation compatible with the existing
 * `LanguageConfig` contract. Drop it into the language config object you pass to
 * the editor — no other UI change required.
 */
export function makeGetSuggestions(engine: FalkorCypherEngine) {
  return async (
    monacoInstance: Monaco,
    _context?: monaco.languages.CompletionContext,
    model?: monaco.editor.ITextModel,
    position?: monaco.Position
  ) => {
    if (!model || !position) return { suggestions: [], incomplete: true };
    // Monaco columns are 1-based; the engine wants a 0-based column offset.
    const candidates = engine.getCompletions(model.getValue(), position.lineNumber, position.column - 1);
    // incomplete: true → Monaco re-invokes on every keystroke, so error-tolerant
    // context (e.g. "MATCH (n:") is recomputed live instead of stale-filtered.
    return { suggestions: toCompletionItems(monacoInstance, candidates), incomplete: true };
  };
}

/**
 * Hook the engine into Monaco's input stream for REAL-TIME (on-input) linting.
 *
 * @returns a disposer that removes the listener and clears markers.
 *
 * `onValidityChange(isValid)` is called whenever validity flips — wire it to the
 * `isQueryValid` state that gates the run button, so invalid syntax can never be
 * submitted (requirement 6).
 */
export function attachRealtimeLinting(
  monacoInstance: Monaco,
  editor: monaco.editor.IStandaloneCodeEditor,
  engine: FalkorCypherEngine,
  onValidityChange: (isValid: boolean) => void
): monaco.IDisposable {
  let lastValid: boolean | undefined;

  const run = () => {
    const model = editor.getModel();
    if (!model) return;

    const errors = engine.lint(model.getValue());

    // Push syntax errors as Error-severity markers (red squigglies) under the
    // SAME owner the rest of the app uses.
    monacoInstance.editor.setModelMarkers(
      model,
      FALKOR_MARKER_OWNER,
      errors.map((e) => ({
        message: e.message,
        severity: monacoInstance.MarkerSeverity.Error,
        source: FALKOR_MARKER_OWNER,
        startLineNumber: e.startLineNumber,
        startColumn: e.startColumn,
        endLineNumber: e.endLineNumber,
        endColumn: e.endColumn,
      }))
    );

    // Toggle the execution gate only when it actually changes.
    const isValid = errors.length === 0;
    if (isValid !== lastValid) {
      lastValid = isValid;
      onValidityChange(isValid);
    }
  };

  // Validate on every content change AND once immediately for the initial value.
  const sub = editor.onDidChangeModelContent(run);
  run();

  return {
    dispose() {
      sub.dispose();
      const model = editor.getModel();
      if (model && !model.isDisposed()) {
        monacoInstance.editor.setModelMarkers(model, FALKOR_MARKER_OWNER, []);
      }
    },
  };
}
