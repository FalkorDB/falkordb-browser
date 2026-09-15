/* eslint-disable no-param-reassign */

'use client';

import { useState, useCallback, useContext, Dispatch, SetStateAction } from "react";
import { createPortal } from "react-dom";
import { cn, formatName, HistoryQuery } from "@/lib/utils";
import { History, Info, Network, Sparkles, Upload } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import useIsMobile from "@/lib/useIsMobile";
import Button from "../components/ui/Button";
import DialogComponent from "../components/DialogComponent";
import { BrowserSettingsContext, ConnectionContext, CypherLanguageContext, IndicatorContext, PanelContext } from "../components/provider";
import CypherEditor from "../components/CypherEditor";
import { Graph } from "../api/graph/model";
import QueryHistoryPanel from "./QueryHistoryPanel";
import UploadGraph from "../components/graph/UploadGraph";
import ResizableBox from "@/components/ui/ResizableBox";
import { useResizableSize } from "@/lib/useResizableSize";

interface Props {
    graph: Graph
    options: string[]
    setOptions: Dispatch<SetStateAction<string[]>>
    graphName: string
    setGraphName: (value: string) => void
    setGraph: Dispatch<SetStateAction<Graph>>
    chatOpen?: boolean
    setChatOpen?: Dispatch<SetStateAction<boolean>>
    queriesOpen?: boolean
    setQueriesOpen?: Dispatch<SetStateAction<boolean>>
    runQuery: (query: string) => Promise<void>;
    historyQuery: HistoryQuery;
    setHistoryQuery: Dispatch<SetStateAction<HistoryQuery>>;
    isQueryLoading: boolean;
}

export default function Selector({
    graph,
    options,
    setOptions,
    graphName,
    setGraphName,
    runQuery,
    historyQuery,
    setHistoryQuery,
    setGraph,
    isQueryLoading,
    chatOpen,
    setChatOpen,
    queriesOpen,
    setQueriesOpen
}: Props) {

    const { indicator } = useContext(IndicatorContext);
    const { settings: { querySettings: { limitSettings: { limit, lastLimit } }, userExperienceSettings: { captionKeysSettings: { showPropertyKeyPrefix } } }, tutorialOpen } = useContext(BrowserSettingsContext);
    const { isReadOnly } = useContext(ConnectionContext);
    const { cypherLanguageConfig, setCypherLanguageConfig } = useContext(CypherLanguageContext);
    const { panelOpen, onTogglePanel, mobileToolbarSlot } = useContext(PanelContext);
    const isMobile = useIsMobile();

    const [maximize, setMaximize] = useState(false);
    const [uploadOpen, setUploadOpen] = useState(false);
    const handleLanguageConfig = useCallback((config: NonNullable<typeof cypherLanguageConfig>) => {
        setCypherLanguageConfig(config);
    }, [setCypherLanguageConfig]);

    const { size: historySize, onResize: onHistoryResize } = useResizableSize("queryHistory-size", 560, 600, 350, 300);

    const separator = <div className="h-4 w-px bg-border rounded-full" />;

    const handleOnChange = (name: string) => {
        setGraphName(formatName(name));
    };

    const canvasTips = (
        <div className="text-primary">
            <p>Select And Show Properties (Click)</p>
            {/* Touch has no Ctrl key, so the toolbar toggle is the only way in. */}
            <p>{isMobile ? "Select Multiple Entities (Turn On Multi Select)" : "Select Multiple Entities (Click + Left Ctrl)"}</p>
            <p>Select 2 Nodes to Create Edge</p>
            <p>Expand And Collapse Neighbors (Double Click)</p>
        </div>
    );

    // Rendered as a tooltip on desktop and as plain text inside the overflow menu
    // on mobile, where there is no hover to reveal it.
    const canvasNotices = (() => {
        const hasLimitWarning = graph.CurrentLimit && graph.Data.length >= graph.CurrentLimit;
        const hasLimitChangeWarning = graph.CurrentLimit && lastLimit !== limit;
        const hasPrefixChange = graph.ShowPropertyKeyPrefix !== showPropertyKeyPrefix;
        const showInfo = graphName && !isReadOnly;
        const hasWarning = hasLimitWarning || hasLimitChangeWarning || hasPrefixChange;

        if (!showInfo && !hasWarning) return null;

        return (
            <div className="flex flex-col gap-1 max-w-xs">
                {showInfo && canvasTips}
                {
                    hasWarning && (
                        <div className="text-orange-300">
                            {hasLimitWarning && <p>Data currently limited to {graph.Data.length} rows</p>}
                            {hasLimitChangeWarning && <p>Rerun the query to apply the new limit.</p>}
                            {hasPrefixChange && <p>Rerun the query to apply the new property key prefix settings.</p>}
                        </div>
                    )
                }
            </div>
        );
    })();

    const graphInfoButton = (
        <Button
            aria-label="Graph info panel"
            aria-pressed={panelOpen}
            indicator={indicator}
            className={cn(
                "h-full text-foreground p-2 rounded-lg border border-border bg-background hover:bg-secondary",
                panelOpen && "!text-primary"
            )}
            title="Graph info"
            onClick={() => {
                onTogglePanel();
            }}
            data-testid="graphInfoToggle"
        >
            <Network />
        </Button>
    );

    const chatButton = (
        <Button
            aria-label="Chat panel"
            aria-pressed={chatOpen}
            data-testid="chatToggleButton"
            className={cn(
                "text-foreground border border-border rounded-lg p-2 hover:bg-secondary mobile:h-full",
                chatOpen && "!text-primary"
            )}
            indicator={indicator}
            title="Chat"
            disabled={!graphName}
            onClick={() => setChatOpen?.(prev => !prev)}
        >
            <Sparkles />
        </Button>
    );

    const editorNode = (
        <div className="h-full w-1 grow relative overflow-visible">
            <CypherEditor
                graph={graph}
                graphName={graphName}
                maximize={maximize}
                setMaximize={setMaximize}
                runQuery={runQuery}
                isQueryLoading={isQueryLoading}
                historyQuery={historyQuery}
                setHistoryQuery={setHistoryQuery}
                editorKey={queriesOpen ? "selector-theme" : "editor-theme"}
                onLanguageConfig={handleLanguageConfig}
            />
        </div>
    );

    const uploadDialog = (
        <UploadGraph
            graphName={graphName}
            disabled={isReadOnly || !graphName}
            open={uploadOpen}
            onOpenChange={setUploadOpen}
        />
    );

    if (isMobile) {
        // Portalled into the nav row: those actions and the tab switcher together
        // fit one row, which leaves the editor as the only thing above the canvas.
        const action = "h-full shrink-0 text-foreground p-2 rounded-lg border border-border bg-background hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed";

        // Same left-to-right order as the desktop bar, so the two layouts stay learnable.
        const toolbar = (
            <>
                {graphInfoButton}
                <Button
                    data-testid="uploadGraphToolbarTrigger"
                    aria-label="Upload data"
                    title="Upload data"
                    className={action}
                    disabled={isReadOnly || !graphName}
                    onClick={() => setUploadOpen(true)}
                >
                    <Upload />
                </Button>
                <Button
                    data-testid="queryHistory"
                    aria-label="Query history panel"
                    title="Query history"
                    className={action}
                    disabled={historyQuery.queries.length === 0}
                    onClick={() => setQueriesOpen?.(true)}
                >
                    <History />
                </Button>
                <Popover>
                    {/* A plain button, not `Button`: its tooltip wrapper would swallow
                        the trigger's ref. */}
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            data-testid="selectorCanvasInfo"
                            aria-label="Canvas tips"
                            className={cn(action, "flex items-center justify-center")}
                        >
                            <Info />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="z-50 w-[80vw] max-w-[320px] bg-background text-xs">
                        {canvasNotices ?? canvasTips}
                    </PopoverContent>
                </Popover>
                {chatButton}
            </>
        );

        return (
            <div className="z-20 w-full flex flex-col gap-2">
                {mobileToolbarSlot && createPortal(toolbar, mobileToolbarSlot)}
                {uploadDialog}
                <div className="w-full h-[44px] flex flex-row items-center">
                    {editorNode}
                </div>
                {/* Inset like every other mobile dialog rather than edge-to-edge, but with a
                    definite height so the list/editor flex chain has something to divide. */}
                <DialogComponent
                    open={queriesOpen}
                    onOpenChange={open => setQueriesOpen?.(open)}
                    title="Query history"
                    trigger={<span className="hidden" />}
                    className="w-[94vw] max-w-none h-[80dvh]"
                >
                    <div className="h-1 grow min-h-0">
                        <QueryHistoryPanel
                            graphName={graphName}
                            onClose={() => setQueriesOpen?.(false)}
                            languageConfig={cypherLanguageConfig ?? undefined}
                        />
                    </div>
                </DialogComponent>
            </div>
        );
    }

    return (
        <div className="z-20 w-full h-[44px] flex flex-row gap-3 items-center">
            {graphInfoButton}
            <Button
                aria-label="Upload data"
                className={cn(
                    "h-full text-foreground p-2 rounded-lg border border-border bg-background hover:bg-secondary"
                )}
                title="Upload data"
                disabled={isReadOnly || !graphName}
                onClick={() => setUploadOpen(true)}
                data-testid="uploadGraphToolbarTrigger"
            >
                <Upload size={20} />
            </Button>
            {uploadDialog}
            {editorNode}
            <div className="h-full w-fit flex gap-3 items-center p-2 border border-border rounded-lg bg-background">
                <Popover open={queriesOpen} onOpenChange={setQueriesOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            aria-label="Query history panel"
                            aria-pressed={queriesOpen}
                            data-testid="queryHistory"
                            className={cn(queriesOpen && "!text-primary")}
                            disabled={historyQuery.queries.length === 0}
                            title={historyQuery.queries.length === 0 ? "No queries" : "View past queries"}
                        >
                            <History />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        align="start"
                        sideOffset={20}
                        className="z-30 p-0 border-none bg-transparent shadow-none w-auto h-auto overflow-visible"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        onInteractOutside={(e) => {
                            if (tutorialOpen) {
                                e.preventDefault();
                                return;
                            }
                            if ((e.target as Element)?.closest?.('[data-tutorial-overlay]')) {
                                e.preventDefault();
                            }
                            if ((e.target as Element)?.closest?.('[role="separator"]')) {
                                e.preventDefault();
                            }
                        }}
                        onEscapeKeyDown={(e) => {
                            // When Monaco has focus, let it handle Escape (closes suggestions).
                            if ((e.target as HTMLElement)?.closest?.('.monaco-editor')) {
                                e.preventDefault();
                                return;
                            }
                            if ((e.target as Element)?.closest?.('[data-tutorial-overlay]')) {
                                e.preventDefault();
                            }
                        }}
                    >
                        <ResizableBox
                            width={historySize.width}
                            height={historySize.height}
                            minWidth={350}
                            minHeight={300}
                            onResizeEnd={(w, h) => onHistoryResize(w, h)}
                            direction="bottom-left"
                        >
                            <QueryHistoryPanel graphName={graphName} onClose={() => setQueriesOpen?.(false)} languageConfig={cypherLanguageConfig ?? undefined} />
                        </ResizableBox>
                    </PopoverContent>
                </Popover>
                {
                    canvasNotices &&
                    <>
                        {separator}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    data-testid="selectorCanvasInfo"
                                    className="cursor-default"
                                >
                                    <Info />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {canvasNotices}
                            </TooltipContent>
                        </Tooltip>
                    </>
                }
            </div>
            {chatButton}
        </div >
    );
}
