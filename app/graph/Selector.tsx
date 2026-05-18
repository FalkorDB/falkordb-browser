/* eslint-disable no-param-reassign */

'use client';

import { useState, useContext, Dispatch, SetStateAction } from "react";
import { cn, formatName, HistoryQuery } from "@/lib/utils";
import { History, Info, Network, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Button from "../components/ui/Button";
import { BrowserSettingsContext, ConnectionContext, IndicatorContext, PanelContext } from "../components/provider";
import CypherEditor from "../components/CypherEditor";
import { Graph } from "../api/graph/model";
import QueryHistoryPanel from "./QueryHistoryPanel";

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
    const { settings: { limitSettings: { limit, lastLimit }, showPropertyKeyPrefixSettings: { showPropertyKeyPrefix } } } = useContext(BrowserSettingsContext);
    const { isReadOnly } = useContext(ConnectionContext);
    const { panelOpen, onTogglePanel } = useContext(PanelContext);

    const [maximize, setMaximize] = useState(false);

    const separator = <div className="h-[80%] w-0.5 bg-border rounded-full" />;

    const handleOnChange = (name: string) => {
        setGraphName(formatName(name));
    };

    return (
        <div className="z-20 w-full h-[44px] flex flex-row gap-3 items-center">
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
                <Network size={20} />
            </Button>
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
                />
            </div>
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
                        className="z-30 w-[560px] h-[600px] p-0 border-none bg-transparent shadow-none"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        onInteractOutside={(e) => {
                            if ((e.target as Element)?.closest?.('[data-tutorial-overlay]')) {
                                e.preventDefault();
                            }
                        }}
                        onEscapeKeyDown={(e) => {
                            if ((e.target as Element)?.closest?.('[data-tutorial-overlay]')) {
                                e.preventDefault();
                            }
                        }}
                    >
                        <QueryHistoryPanel graphName={graphName} onClose={() => setQueriesOpen?.(false)} />
                    </PopoverContent>
                </Popover>
                {
                    (() => {
                        const hasLimitWarning = graph.CurrentLimit && graph.Data.length >= graph.CurrentLimit;
                        const hasLimitChangeWarning = graph.CurrentLimit && lastLimit !== limit;
                        const hasPrefixChange = graph.ShowPropertyKeyPrefix !== showPropertyKeyPrefix;
                        const hasWarning = hasLimitWarning || hasLimitChangeWarning || hasPrefixChange;
                        const showInfo = graphName && !isReadOnly;

                        if (!showInfo && !hasWarning) return null;

                        return (
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
                                        <div className="flex flex-col gap-1 max-w-xs">
                                            {
                                                showInfo && (
                                                    <div className="text-primary">
                                                        <p>Select And Show Properties (Right Click)</p>
                                                        <p>Select Multiple Entities (Right Click + Left Ctrl)</p>
                                                        <p>Select 2 Nodes to Create Edge</p>
                                                    </div>
                                                )
                                            }
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
                                    </TooltipContent>
                                </Tooltip>
                            </>
                        );
                    })()
                }
            </div>
            <Button
                aria-label="Chat panel"
                aria-pressed={chatOpen}
                data-testid="chatToggleButton"
                className={cn(
                    "text-foreground border border-border rounded-lg p-2 hover:bg-secondary",
                    chatOpen && "!text-primary"
                )}
                indicator={indicator}
                title="Chat"
                disabled={!graphName}
                onClick={() => setChatOpen?.(prev => !prev)}
            >
                <Sparkles />
            </Button>
        </div >
    );
}
