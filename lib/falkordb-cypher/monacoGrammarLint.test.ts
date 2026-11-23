import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Monaco } from "@monaco-editor/react";
import type * as monaco from "monaco-editor";
import { createFalkorCypherEngine } from "./engine.ts";
import {
  attachGrammarLinting,
  getGrammarDiagnostics,
  GRAMMAR_MARKER_OWNER,
  registerGrammarCodeActions,
} from "./monacoGrammarLint.ts";

describe("Monaco grammar integration", () => {
  it("updates markers and validity as the query changes and cleans up model diagnostics", () => {
    let text = "RETURN 1";
    let listenerDisposed = false;
    let onChange = () => {};
    const validity: boolean[] = [];
    const markers: monaco.editor.IMarkerData[][] = [];
    const model = {
      uri: { toString: () => "test://grammar-lint" },
      getValue: () => text,
      isDisposed: () => false,
    } as monaco.editor.ITextModel;
    const editor = {
      getModel: () => model,
      onDidChangeModelContent: (callback: () => void) => {
        onChange = callback;
        return { dispose: () => { listenerDisposed = true; } };
      },
    } as monaco.editor.IStandaloneCodeEditor;
    const monacoInstance = {
      MarkerSeverity: { Error: 8 },
      editor: {
        setModelMarkers: (actualModel: monaco.editor.ITextModel, owner: string, value: monaco.editor.IMarkerData[]) => {
          assert.equal(actualModel, model);
          assert.equal(owner, GRAMMAR_MARKER_OWNER);
          markers.push(value);
        },
      },
    } as Monaco;

    const subscription = attachGrammarLinting(monacoInstance, editor, createFalkorCypherEngine(), (valid) => validity.push(valid));
    assert.deepEqual(validity, [true]);
    assert.deepEqual(markers.at(-1), []);

    text = "MATCH (n RETURN n";
    onChange();
    assert.deepEqual(validity, [true, false]);
    const diagnostics = getGrammarDiagnostics(model);
    assert.ok(diagnostics.length > 0);
    assert.equal(markers.at(-1)?.[0].source, GRAMMAR_MARKER_OWNER);
    assert.match(markers.at(-1)?.[0].message ?? "", /Unexpected|Missing/);

    onChange();
    assert.deepEqual(validity, [true, false]);
    text = "RETURN 2";
    onChange();
    assert.deepEqual(validity, [true, false, true]);
    assert.deepEqual(getGrammarDiagnostics(model), []);

    subscription.dispose();
    assert.equal(listenerDisposed, true);
    assert.deepEqual(markers.at(-1), []);
    assert.deepEqual(getGrammarDiagnostics(model), []);
  });

  it("removes diagnostics when the editor no longer has a model", () => {
    let currentModel: monaco.editor.ITextModel | null;
    let onChange = () => {};
    const model = {
      uri: { toString: () => "test://removed-model" },
      getValue: () => "MATCH (n RETURN n",
      isDisposed: () => true,
    } as monaco.editor.ITextModel;
    currentModel = model;
    const editor = {
      getModel: () => currentModel,
      onDidChangeModelContent: (callback: () => void) => {
        onChange = callback;
        return { dispose() {} };
      },
    } as monaco.editor.IStandaloneCodeEditor;
    const monacoInstance = {
      MarkerSeverity: { Error: 8 },
      editor: { setModelMarkers: () => {} },
    } as Monaco;
    const subscription = attachGrammarLinting(monacoInstance, editor, createFalkorCypherEngine(), () => {});
    assert.ok(getGrammarDiagnostics(model).length > 0);
    currentModel = null;
    onChange();
    subscription.dispose();
    assert.deepEqual(getGrammarDiagnostics(model), []);
  });

  it("registers one provider and uses the latest AI fix callback", () => {
    let provider: monaco.languages.CodeActionProvider | undefined;
    let command: ((accessor: unknown, query: string, error: string) => void) | undefined;
    const requests: string[][] = [];
    const model = {
      uri: { toString: () => "test://grammar-actions" },
      getValue: () => "MATCH (n RETURN n",
      isDisposed: () => false,
      getVersionId: () => 1,
    } as monaco.editor.ITextModel;
    const monacoInstance = {
      MarkerSeverity: { Error: 8 },
      editor: {
        setModelMarkers: () => {},
        registerCommand: (_id: string, handler: typeof command) => { command = handler; return { dispose() {} }; },
      },
      languages: {
        registerCodeActionProvider: (_language: string, actualProvider: monaco.languages.CodeActionProvider) => {
          provider = actualProvider;
          return { dispose() {} };
        },
      },
    } as Monaco;
    const editor = {
      getModel: () => model,
      onDidChangeModelContent: (_callback: () => void) => ({ dispose() {} }),
    } as monaco.editor.IStandaloneCodeEditor;
    const lint = attachGrammarLinting(monacoInstance, editor, createFalkorCypherEngine(), () => {});
    assert.ok(registerGrammarCodeActions(monacoInstance, "cypher", () => ({
      aiFixSupported: false,
      requestAiFix: () => assert.fail("outdated callback"),
    })));
    assert.ok(provider);
    const diagnostics = getGrammarDiagnostics(model);
    const marker = {
      ...diagnostics[0],
      source: GRAMMAR_MARKER_OWNER,
      code: diagnostics[0].code,
      severity: 8,
      owner: GRAMMAR_MARKER_OWNER,
      resource: model.uri,
    } as monaco.editor.IMarker;
    const noMarkers = provider.provideCodeActions(model, {} as monaco.Range, { markers: [{ ...marker, source: "other" }], trigger: 1 }, {} as monaco.CancellationToken);
    assert.ok(noMarkers && !("then" in noMarkers));
    assert.deepEqual(noMarkers.actions, []);
    const withoutAi = provider.provideCodeActions(model, {} as monaco.Range, { markers: [marker], trigger: 1 }, {} as monaco.CancellationToken);
    assert.ok(withoutAi && !("then" in withoutAi));
    assert.equal(withoutAi.actions.some((action) => action.title === "✨ Fix with AI"), false);
    assert.equal(registerGrammarCodeActions(monacoInstance, "cypher", () => ({
      aiFixSupported: true,
      requestAiFix: (query, error) => requests.push([query, error]),
    })), null);
    const actions = provider.provideCodeActions(model, {} as monaco.Range, { markers: [marker], trigger: 1 }, {} as monaco.CancellationToken);
    assert.ok(actions && !("then" in actions));
    const fix = actions.actions.find((action) => action.title === "✨ Fix with AI");
    assert.ok(fix?.command);
    assert.deepEqual(fix.command.arguments, [model.getValue(), diagnostics[0].message]);
    assert.ok(command);
    command(undefined, model.getValue(), diagnostics[0].message);
    assert.deepEqual(requests, [[model.getValue(), diagnostics[0].message]]);
    lint.dispose();
  });
});
