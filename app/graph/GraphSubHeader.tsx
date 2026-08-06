"use client";

import { useContext, useState } from "react";
import { Pencil, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { tabStripItemWidth } from "@/lib/useGraphTabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GraphTabsContext } from "../components/provider";

/**
 * Full-width sub-header for the /graph route.
 *
 * Sits directly under the app `Header` and above the graph info panel + graph
 * view split, and hosts the per-connection working contexts ("tabs") so the
 * user can keep several graph/query setups side by side.
 */
export default function GraphSubHeader() {
  const { tabs, activeTabId, maxTabs, selectTab, addTab, renameTab, closeTab } = useContext(GraphTabsContext);

  // The tab being renamed, and the text typed so far. The draft starts from the
  // custom name only: an empty box is what clears it back to the graph name.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  // The last remaining tab cannot be closed — there is always one context.
  const canClose = tabs.length > 1;
  const canAdd = tabs.length < maxTabs;

  // A full strip has to fit `maxTabs` pills, the add button and the gaps.
  const tabMaxWidth = tabStripItemWidth(maxTabs);

  const commitRename = () => {
    if (editingId) renameTab(editingId, draft);
    setEditingId(null);
  };

  return (
    <div
      data-testid="graphSubHeader"
      className="shrink-0 flex items-center gap-1 h-8 px-2 border-b border-border/50 bg-background overflow-x-auto hide-scrollbar"
    >
      {
        tabs.map(tab => {
          const label = tab.name || tab.graphName || "New tab";
          const isActive = tab.id === activeTabId;
          const isEditing = tab.id === editingId;

          return (
            <div
              key={tab.id}
              // Keyed on the tab id, not the label: labels are neither stable
              // (renaming changes them) nor unique (two blank tabs are both
              // "New tab"). The label is exposed separately for assertions.
              data-testid={`graphTab-${tab.id}`}
              data-tab-label={label}
              data-active={isActive}
              style={{ maxWidth: tabMaxWidth }}
              className={cn(
                "shrink-0 flex items-center gap-1 h-6 p-1 rounded-lg border transition-colors",
                isActive
                  ? "bg-secondary border-border text-primary"
                  : "bg-transparent border-transparent hover:bg-secondary/50"
              )}
            >
              {
                isEditing
                  ? <input
                    data-testid={`graphTabRename-${tab.id}`}
                    className="w-full min-w-0 bg-transparent text-sm outline-none border-b border-primary"
                    aria-label={`Rename ${label}`}
                    placeholder={tab.graphName || "New tab"}
                    value={draft}
                    autoFocus
                    onChange={e => setDraft(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={e => {
                      if (e.key === "Enter") commitRename();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                  : <>
                    <button
                      type="button"
                      data-testid={`graphTabSelect-${tab.id}`}
                      className="min-w-0 flex-1 truncate text-left text-sm"
                      title={label}
                      aria-current={isActive}
                      onClick={() => selectTab(tab.id)}
                    >
                      {label}
                    </button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          data-testid={`graphTabRenameTrigger-${tab.id}`}
                          className="rounded hover:bg-background"
                          aria-label={`Rename ${label}`}
                          onClick={() => {
                            setDraft(tab.name ?? "");
                            setEditingId(tab.id);
                          }}
                        >
                          <Pencil size={12} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Rename tab</TooltipContent>
                    </Tooltip>
                  </>
              }
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* Wrapper keeps the tooltip reachable while the button is disabled */}
                  <span className="flex">
                    <button
                      type="button"
                      data-testid={`graphTabClose-${tab.id}`}
                      className="rounded hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label={`Close ${label}`}
                      disabled={!canClose}
                      onClick={() => closeTab(tab.id)}
                    >
                      <X size={12} />
                    </button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {canClose ? "Close tab" : "The last tab can't be closed"}
                </TooltipContent>
              </Tooltip>
            </div>
          );
        })
      }
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Wrapper keeps the tooltip reachable while the button is disabled */}
          <span className="flex">
            <button
              type="button"
              data-testid="graphTabAdd"
              className="shrink-0 p-1 rounded-lg hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="New tab"
              disabled={!canAdd}
              onClick={addTab}
            >
              <Plus size={16} />
            </button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {canAdd ? "New tab" : `Max ${maxTabs} tabs — raise the limit in Settings`}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
