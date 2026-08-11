// ---------------------------------------------------------------------------
// falkordb-cypher — Monaco grammar-lint glue
// ---------------------------------------------------------------------------
// Wires the engine's real-time linting into any Monaco editor and feeds the
// resulting enriched diagnostics into Monaco's marker + code-action systems.
// A module-level registry keyed by model URI lets a SINGLE code-action provider
// serve ANY number of editors (main editor, history editor, …) — each editor
// just writes its own model's diagnostics.
//
// This grammar-specific module imports Monaco directly (alongside monacoGlue.ts).
// ---------------------------------------------------------------------------

import type { Monaco } from "@monaco-editor/react";
import type * as monaco from "monaco-editor";
import { codeActionEditsForMarkers, type EditorDiagnostic } from "../cypherDiagnostics.ts";
import { grammarErrorsToDiagnostics } from "./grammarDiagnostics.ts";
import type { FalkorCypherEngine } from "./engine.ts";

/** Marker owner for real-time grammar syntax errors (distinct from backend ones). */
export const GRAMMAR_MARKER_OWNER = "cypher-grammar";

// model URI → enriched diagnostics currently shown for that model.
const grammarRegistry = new Map<string, EditorDiagnostic[]>();

/** Read the enriched diagnostics currently shown for a model (used by tests/UI). */
export function getGrammarDiagnostics(model: monaco.editor.ITextModel): EditorDiagnostic[] {
  return grammarRegistry.get(model.uri.toString()) ?? [];
}

function toMarkers(
  monacoInstance: Monaco,
  diagnostics: EditorDiagnostic[]
): monaco.editor.IMarkerData[] {
  return diagnostics.map((d) => ({
    severity: monacoInstance.MarkerSeverity.Error,
    // Same "message + 💡 hint" format the backend-diagnostics markers use.
    message: d.hint ? `${d.message}\n\n💡 ${d.hint}` : d.message,
    code: d.code,
    source: GRAMMAR_MARKER_OWNER,
    startLineNumber: d.startLineNumber,
    startColumn: d.startColumn,
    endLineNumber: d.endLineNumber,
    endColumn: d.endColumn,
  }));
}

/**
 * Attach real-time grammar linting to an editor.
 *
 * On every input change it lints, enriches, paints squigglies, records the
 * diagnostics for the code-action provider, and toggles validity (to gate Run).
 * Returns the first (prettified) error message via `onValidityChange` consumers
 * through `getGrammarDiagnostics`. Disposes with the editor.
 */
export function attachGrammarLinting(
  monacoInstance: Monaco,
  editor: monaco.editor.IStandaloneCodeEditor,
  engine: FalkorCypherEngine,
  onValidityChange: (isValid: boolean) => void
): monaco.IDisposable {
  let lastValid: boolean | undefined;

  const run = () => {
    const model = editor.getModel();
    if (!model) return;
    const text = model.getValue();
    const diagnostics = grammarErrorsToDiagnostics(text, engine.lint(text));

    grammarRegistry.set(model.uri.toString(), diagnostics);
    monacoInstance.editor.setModelMarkers(model, GRAMMAR_MARKER_OWNER, toMarkers(monacoInstance, diagnostics));

    const isValid = diagnostics.length === 0;
    if (isValid !== lastValid) {
      lastValid = isValid;
      onValidityChange(isValid);
    }
  };

  const sub = editor.onDidChangeModelContent(run);
  run(); // validate the initial value immediately

  return {
    dispose() {
      sub.dispose();
      const model = editor.getModel();
      if (model && !model.isDisposed()) {
        monacoInstance.editor.setModelMarkers(model, GRAMMAR_MARKER_OWNER, []);
        grammarRegistry.delete(model.uri.toString());
      }
    },
  };
}

/** Accessor for the current AI-fix capability + trigger (read fresh each call). */
export interface AiFixBridge {
  aiFixSupported: boolean;
  requestAiFix: (query: string, errorMessage: string) => void;
}

let codeActionsRegistered = false;

/**
 * Register ONE code-action provider (guarded) that serves grammar diagnostics
 * for every editor via the shared registry. Offers "Did you mean…?" quick fixes
 * and a "✨ Fix with AI" action for syntax errors.
 *
 * @param getAiFix returns the current AI-fix bridge so the action always uses
 *                 up-to-date capability/handlers without re-registering.
 */
export function registerGrammarCodeActions(
  monacoInstance: Monaco,
  languageId: string,
  getAiFix: () => AiFixBridge
): monaco.IDisposable | null {
  if (codeActionsRegistered) return null;
  codeActionsRegistered = true;

  const disposable = monacoInstance.languages.registerCodeActionProvider(languageId, {
    provideCodeActions: (
      model: monaco.editor.ITextModel,
      _range: monaco.Range,
      context: monaco.languages.CodeActionContext
    ): monaco.languages.CodeActionList => {
      const markers = context.markers.filter((m) => m.source === GRAMMAR_MARKER_OWNER);
      if (markers.length === 0) return { actions: [], dispose: () => {} };

      const diagnostics = grammarRegistry.get(model.uri.toString()) ?? [];
      const actions: monaco.languages.CodeAction[] = [];

      // "Did you mean…?" replacement quick fixes.
      const edits = codeActionEditsForMarkers(
        diagnostics,
        markers.map((m) => ({
          code: typeof m.code === "string" ? m.code : (m.code?.value ?? ""),
          startLineNumber: m.startLineNumber,
          startColumn: m.startColumn,
          endLineNumber: m.endLineNumber,
          endColumn: m.endColumn,
        }))
      );
      edits.forEach((e) => {
        actions.push({
          title: e.title,
          kind: "quickfix",
          edit: {
            edits: [
              {
                resource: model.uri,
                versionId: model.getVersionId(),
                textEdit: { range: new monacoInstance.Range(e.range.startLineNumber, e.range.startColumn, e.range.endLineNumber, e.range.endColumn), text: e.newText },
              },
            ],
          },
        });
      });

      // "✨ Fix with AI" — only when AI is configured. Reuses the same requestAiFix
      // flow the failed-run toast uses, so grammar errors get AI fixes too.
      const { aiFixSupported, requestAiFix } = getAiFix();
      if (aiFixSupported) {
        const firstError = diagnostics[0];
        actions.push({
          title: "✨ Fix with AI",
          kind: "quickfix",
          command: {
            id: registerAiFixCommand(monacoInstance, requestAiFix),
            title: "Fix with AI",
            arguments: [model.getValue(), firstError?.message ?? "syntax error"],
          },
        });
      }

      return { actions, dispose: () => {} };
    },
  });

  return disposable;
}

// The AI-fix command is registered once; the handler indirection lets us always
// call the latest requestAiFix passed in.
let aiFixCommandId: string | null = null;
let latestRequestAiFix: (query: string, errorMessage: string) => void = () => {};

function registerAiFixCommand(
  monacoInstance: Monaco,
  requestAiFix: (query: string, errorMessage: string) => void
): string {
  latestRequestAiFix = requestAiFix;
  if (aiFixCommandId) return aiFixCommandId;
  // registerCommand returns a disposable; the id is what CodeAction.command needs.
  const id = "falkordb.cypher.fixWithAI";
  monacoInstance.editor.registerCommand(id, (_accessor: unknown, query: string, errorMessage: string) => {
    latestRequestAiFix(query, errorMessage);
  });
  aiFixCommandId = id;
  return id;
}
