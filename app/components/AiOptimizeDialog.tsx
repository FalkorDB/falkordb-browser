"use client";

import { ChevronDown, ListTree, Sparkles } from "lucide-react";
import Button from "./ui/Button";
import DialogComponent from "./DialogComponent";
import type { QueryOptimizationAnalysis } from "@/lib/aiOptimize";
import SuggestedQuery from "./SuggestedQuery";

export type AiOptimizeResultState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; query: string; result: QueryOptimizationAnalysis };

export type AiOptimizeConsent = {
  query: string;
  graphName: string;
  provider: string;
};

interface Props {
  open: boolean;
  pendingConsent: AiOptimizeConsent | null;
  dontAskAgain: boolean;
  result: AiOptimizeResultState;
  currentQuery: string;
  onOpenChange: (open: boolean) => void;
  onDontAskAgainChange: (checked: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onUseQuery: (query: string) => void;
}

export default function AiOptimizeDialog({
  open,
  pendingConsent,
  dontAskAgain,
  result,
  currentQuery,
  onOpenChange,
  onDontAskAgainChange,
  onConfirm,
  onCancel,
  onUseQuery,
}: Props) {
  const canApply = result.status === "done"
    && currentQuery.trim() === result.query.trim()
    && Boolean(result.result.optimizedQuery);

  return (
    <DialogComponent
      title={pendingConsent ? "Send query context to AI?" : "Query optimization"}
      label="aiOptimize"
      trigger={<span className="hidden" aria-hidden />}
      open={open}
      onOpenChange={onOpenChange}
      className="w-[min(56rem,calc(100vw-2rem))] max-w-none gap-0 p-4 mobile:p-3"
    >
      {pendingConsent ? (
        <div className="flex min-w-0 flex-col gap-5 px-1 pt-4 pb-1 break-words">
          <p className="text-sm leading-relaxed">
            Your <span className="font-semibold">Cypher query, EXPLAIN plan, and index metadata</span>
            {" "}for graph <span className="font-semibold">{pendingConsent.graphName}</span> will be sent to{" "}
            <span className="font-semibold">{pendingConsent.provider}</span> for analysis.
            The query will not be executed by this workflow.
          </p>
          <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded accent-primary"
              checked={dontAskAgain}
              onChange={(event) => onDontAskAgainChange(event.target.checked)}
              data-testid="aiOptimizeDontAskAgain"
            />
            Don&apos;t ask again for this provider
          </label>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="Secondary" onClick={onCancel}>Cancel</Button>
            <Button variant="Primary" data-testid="aiOptimizeConsentConfirm" onClick={onConfirm}>
              Analyze
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex min-w-0 flex-col gap-4 pt-4" data-testid="aiOptimizeResult">
          {result.status === "loading" && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-5 text-sm" role="status">
              <Sparkles size={20} className="shrink-0 animate-pulse text-primary" />
              <div>
                <p className="font-medium">Analyzing your query</p>
                <p className="mt-1 text-muted-foreground">Reading EXPLAIN and indexes, then asking the AI. Your query is not executed.</p>
              </div>
            </div>
          )}

          {result.status === "done" && (
            <>
              <section className="min-w-0 rounded-lg border border-border bg-muted/20 p-4 mobile:p-3">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Sparkles size={16} className="shrink-0 text-primary" />Analysis</h2>
                <p className="break-words text-sm leading-relaxed whitespace-pre-wrap" data-testid="aiOptimizeExplanation">
                  {result.result.explanation}
                </p>
              </section>

              {result.result.suggestions.length > 0 && (
                <section className="min-w-0 px-1">
                  <h2 className="mb-2 text-sm font-semibold">Recommendations</h2>
                  <ul className="list-disc pl-5 text-sm leading-relaxed space-y-2 break-words marker:text-primary" data-testid="aiOptimizeSuggestions">
                    {result.result.suggestions.map((suggestion, index) => (
                      <li key={`${index}-${suggestion}`}>{suggestion}</li>
                    ))}
                  </ul>
                </section>
              )}

              <details className="group min-w-0 rounded-lg border border-border" data-testid="aiOptimizePlan">
                <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium mobile:px-3 [&::-webkit-details-marker]:hidden">
                  <ListTree size={16} className="shrink-0 text-primary" />
                  EXPLAIN execution plan
                  <ChevronDown size={16} className="ml-auto shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="min-w-0 border-t border-border p-3">
                  <p className="mb-3 text-xs text-muted-foreground">The original query&apos;s plan, generated for this analysis without executing the query.</p>
                  <pre className="max-h-64 overflow-auto rounded-md bg-muted/40 p-3 text-xs leading-relaxed" tabIndex={0} aria-label="Original query execution plan" data-testid="aiOptimizePlanText">
                    {result.result.executionPlan.join("\n")}
                  </pre>
                </div>
              </details>

              {result.result.optimizedQuery ? (
                <SuggestedQuery
                  query={result.result.optimizedQuery}
                  onInsert={onUseQuery}
                  insertDisabled={!canApply}
                  insertDisabledReason={!canApply ? "The editor changed after this analysis. Run Optimize again before applying the suggestion." : undefined}
                  testIds={{ query: "aiOptimizeQuery", copy: "aiOptimizeCopy", insert: "aiOptimizeApply" }}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  The AI did not provide a justified rewritten query. Review the suggestions above.
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Suggestions are not benchmarked. The query is not run automatically.
              </p>
            </>
          )}
        </div>
      )}
    </DialogComponent>
  );
}
