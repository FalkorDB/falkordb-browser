"use client";

import { useContext, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Pencil, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { tabStripItemWidth } from "@/lib/useGraphTabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import useIsMobile from "@/lib/useIsMobile";
import { GraphTabsContext, PanelContext } from "../components/provider";

/**
 * Full-width sub-header for the /graph route.
 *
 * Sits directly under the app `Header` and above the graph info panel + graph
 * view split, and hosts the per-connection working contexts ("tabs") so the
 * user can keep several graph/query setups side by side.
 */
export default function GraphSubHeader() {
  const { tabs, activeTabId, maxTabs, selectTab, addTab, renameTab, closeTab } = useContext(GraphTabsContext);
  const { mobileNavSlot } = useContext(PanelContext);
  const isMobile = useIsMobile();

  // The tab being renamed, and the text typed so far. The draft starts from the
  // custom name only: an empty box is what clears it back to the graph name.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  // Set when Escape cancels a rename, so the blur that follows the unmount does
  // not commit the discarded draft. Cleared by whichever handler consumes it.
  const cancelRenameRef = useRef(false);

  // The last remaining tab cannot be closed — there is always one context.
  const canClose = tabs.length > 1;
  const canAdd = tabs.length < maxTabs;

  // A full strip has to fit `maxTabs` pills, the add button and the gaps.
  const tabMaxWidth = tabStripItemWidth(maxTabs);

  const commitRename = () => {
    // Escape unmounts the input, and the resulting blur would otherwise commit
    // the very draft the user just discarded — the handler still closes over
    // the pre-update `editingId`/`draft`. The flag makes that blur a no-op.
    if (cancelRenameRef.current) {
      cancelRenameRef.current = false;
      return;
    }
    if (editingId) renameTab(editingId, draft);
    setEditingId(null);
  };

  const cancelRename = () => {
    cancelRenameRef.current = true;
    setEditingId(null);
  };

  if (isMobile) {
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    const activeLabel = activeTab?.name || activeTab?.graphName || "New tab";

    // Portalled into the nav row so navigation stays one row on mobile. Test ids
    // match the desktop strip so the page objects carry over.
    //
    // A popover rather than a dropdown menu: a menu registers its items and then
    // swallows Tab, and a tab row is not one item — it is a select button, a
    // rename button, a close button and, mid-rename, a text input. Under a menu
    // none of those are reachable by keyboard and typing in the input feeds the
    // menu's typeahead. A popover leaves normal tab order and typing intact.
    const menu = (
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              data-testid="graphTabsMenu"
              className="min-w-0 grow flex items-center gap-1 rounded-lg px-2 py-1 text-sm hover:bg-secondary"
            >
              <span className="min-w-0 truncate">{activeLabel}</span>
              <span className="shrink-0 text-xs text-muted-foreground">({tabs.length}/{maxTabs})</span>
              <ChevronDown size={14} className="shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent data-testid="graphTabsMenuContent" align="start" className="z-50 w-[85vw] max-w-[340px] bg-background p-1">
            {
              tabs.map(tab => {
                const label = tab.name || tab.graphName || "New tab";
                const isActive = tab.id === activeTabId;

                return (
                  <div
                    key={tab.id}
                    data-testid={`graphTab-${tab.id}`}
                    data-tab-label={label}
                    data-active={isActive}
                    className={cn(
                      "flex items-center gap-1 rounded-lg",
                      isActive ? "bg-secondary text-primary" : "hover:bg-secondary/50"
                    )}
                  >
                    {
                      editingId === tab.id
                        ? <input
                          data-testid={`graphTabRename-${tab.id}`}
                          className="min-w-0 flex-1 border-b border-primary bg-transparent px-2 py-2.5 text-sm outline-none"
                          aria-label={`Rename ${label}`}
                          placeholder={tab.graphName || "New tab"}
                          value={draft}
                          autoFocus
                          onChange={e => setDraft(e.target.value)}
                          onBlur={commitRename}
                          // Escape cancels the rename rather than closing the popover.
                          onKeyDown={e => {
                            e.stopPropagation();
                            if (e.key === "Enter") commitRename();
                            if (e.key === "Escape") cancelRename();
                          }}
                        />
                        : <button
                          type="button"
                          data-testid={`graphTabSelect-${tab.id}`}
                          className="min-w-0 flex-1 truncate px-2 py-2.5 text-left text-sm"
                          aria-current={isActive}
                          onClick={() => {
                            selectTab(tab.id);
                            setMenuOpen(false);
                          }}
                        >
                          {label}
                        </button>
                    }
                    <button
                      type="button"
                      data-testid={`graphTabRenameTrigger-${tab.id}`}
                      className="shrink-0 rounded p-2 hover:bg-background"
                      aria-label={`Rename ${label}`}
                      onClick={() => {
                        cancelRenameRef.current = false;
                        setDraft(tab.name ?? "");
                        setEditingId(tab.id);
                      }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      data-testid={`graphTabClose-${tab.id}`}
                      className="shrink-0 rounded p-2 hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label={`Close ${label}`}
                      disabled={!canClose}
                      onClick={() => closeTab(tab.id)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })
            }
            <div className="-mx-1 my-1 h-px bg-border" />
            <button
              type="button"
              data-testid="graphTabAdd"
              className="w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="New tab"
              disabled={!canAdd}
              onClick={() => {
                addTab();
                setMenuOpen(false);
              }}
            >
              <Plus size={16} />
              <span>{canAdd ? "New tab" : `Max ${maxTabs} tabs`}</span>
            </button>
          </PopoverContent>
        </Popover>
    );

    return mobileNavSlot ? createPortal(menu, mobileNavSlot) : null;
  }

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
                      if (e.key === "Escape") cancelRename();
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
                            cancelRenameRef.current = false;
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
