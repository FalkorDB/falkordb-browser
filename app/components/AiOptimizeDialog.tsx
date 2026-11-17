"use client";

import { ChevronDown, ListTree, Sparkles } from "lucide-react";
import Button from "./ui/Button";
import DialogComponent from "./DialogComponent";
import type { QueryOptimizationAnalysis } from "@/lib/aiOptimize";
import SuggestedQuery from "./SuggestedQuery";

export type AiOptimizeResultState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; query: string; context: string; epoch: number; result: QueryOptimizationAnalysis };

export type AiOptimizeRequest = {
  query: string;
  graphName: string;
  provider: string;
};

interface Props {
  open: boolean;
  pendingRequest: AiOptimizeRequest | null;
  guidance: string;
  result: AiOptimizeResultState;
  currentQuery: string;
  contextMatches: boolean;
  onOpenChange: (open: boolean) => void;
  onGuidanceChange: (guidance: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onUseQuery: (query: string) => void;
}

export default function AiOptimizeDialog({
  open,
  pendingRequest,
  guidance,
  result,
  currentQuery,
  contextMatches,
  onOpenChange,
  onGuidanceChange,
  onConfirm,
  onCancel,
  onUseQuery,
}: Props) {
  const canApply = result.status === "done"
    && contextMatches
    && currentQuery.trim() === result.query.trim()
    && Boolean(result.result.optimizedQuery);

  return (
    <DialogComponent
      title={pendingRequest ? "Optimize your query" : "Query optimization"}
      label="aiOptimize"
      trigger={<span className="hidden" aria-hidden />}
      open={open}
      onOpenChange={onOpenChange}
      className="w-[min(56rem,calc(100vw-2rem))] max-w-none gap-0 p-4 mobile:p-3"
    >
      {pendingRequest ? (
        <div className="flex min-w-0 flex-col gap-5 px-1 pt-4 pb-1 break-words">
          <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor="aiOptimizeGuidance" className="text-sm font-medium">
              What would you like to optimize? <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="aiOptimizeGuidance"
              data-testid="aiOptimizeGuidance"
              className="min-h-28 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              rows={4}
              maxLength={2000}
              value={guidance}
              onChange={event => onGuidanceChange(event.target.value)}
              placeholder="For example: reduce full scans, focus on the slow join, or suggest indexes for this lookup."
              aria-describedby="aiOptimizeGuidanceHelp"
            />
            <p id="aiOptimizeGuidanceHelp" className="text-xs text-muted-foreground">
              Included only in this request, not saved. Query results and write behavior must stay the same.
            </p>
          </div>
          <p className="text-sm leading-relaxed">
            Your <span className="font-semibold">Cypher query, guidance, EXPLAIN plan, and index metadata</span>
            {" "}for graph <span className="font-semibold">{pendingRequest.graphName}</span> will be sent to{" "}
            <span className="font-semibold">{pendingRequest.provider}</span> for analysis.
            The query will not be executed by this workflow.
          </p>
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
                {result.result.indexWarning && <p className="mb-3 text-sm text-muted-foreground" role="status">{result.result.indexWarning}</p>}
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
                  insertDisabledReason={!canApply ? "The query, graph, tab, or connection changed after this analysis. Run Optimize again before applying the suggestion." : undefined}
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
