/* eslint-disable @typescript-eslint/no-use-before-define */

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { fetchOptions, getMemoryUsage, getSSEGraphResult, prepareArg, Row, securedFetch } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { ChevronDown, ChevronUp, Settings, X } from "lucide-react";
import Button from "../components/ui/Button";
import { IndicatorContext, BrowserSettingsContext, ConnectionContext } from "../components/provider";
import PaginationList from "../components/PaginationList";
import TableComponent from "../components/TableComponent";
import ExportGraph from "../components/ExportGraph";
import DeleteGraph from "../components/graph/DeleteGraph";
import DuplicateGraph from "../components/graph/DuplicateGraph";
import UploadGraph from "../components/graph/UploadGraph";
import { Graph } from "../api/graph/model";
import ResizableBox from "@/components/ui/ResizableBox";
import { useResizableSize } from "@/lib/useResizableSize";

interface Props {
    options: string[],
    setOptions: (options: string[]) => void
    selectedValue: string
    setSelectedValue: (value: string) => void
    setGraph: (graph: Graph) => void
}

/**
 * Renders a selectable and manageable list of Graph entities with creation, export, duplicate and delete controls.
 *
 * Renders a dropdown for selecting an existing graph and a management dialog that lists entries with memory, node, and edge metrics (admin users see editable names). Handles loading of options and per-row metric loaders, selection state, and CRUD interactions.
 *
 * @param props.options - Array of graph names shown in the list.
 * @param props.setOptions - Callback to replace the options array.
 * @param props.selectedValue - Currently selected graph name.
 * @param props.setSelectedValue - Callback to update the selected graph name.
 * @param props.setGraph - Callback to set the active Graph model instance when selection changes.
 * @returns The component's rendered JSX element.
 */
export default function SelectGraph({ options, setOptions, selectedValue, setSelectedValue, setGraph }: Props) {

    const { indicator, setIndicator } = useContext(IndicatorContext);
    const { isReadOnly, activeConnectionId } = useContext(ConnectionContext);
    const {
        settings: {
            graphInfo: { showMemoryUsage }
        },
        tutorialOpen
    } = useContext(BrowserSettingsContext);

    const inputRef = useRef<HTMLInputElement>(null);

    const { toast } = useToast();
    const { data: session } = useSession();
    const sessionRole = session?.user.role;

    const [open, setOpen] = useState(false);
    const [rows, setRows] = useState<Row[]>([]);
    const [openMenage, setOpenMenage] = useState(false);
    const [openDuplicate, setOpenDuplicate] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { size: manageSize, onResize: onManageResize } = useResizableSize("manageGraphs-size", 750, 493, 400, 300);

    useEffect(() => {
        setOpen(false);
    }, [selectedValue]);



    const getOptions = useCallback(async () =>
        fetchOptions(toast, setIndicator, indicator, setSelectedValue, setOptions)
        , [toast, setIndicator, indicator, setSelectedValue, setOptions]);

    const loadMemory = useCallback((opt: string) =>
        async () => {
            const memoryMap = await getMemoryUsage(opt, toast, setIndicator, activeConnectionId);
            const memoryValue = memoryMap.get("total_graph_sz_mb") || '<1';

            return `${memoryValue} MB`;
        }, [toast, setIndicator, activeConnectionId]);

    const loadNodesCount = useCallback((opt: string) =>
        async () => {
            try {
                const readOnlyParam = isReadOnly ? '?readOnly=true' : '';
                const result = await getSSEGraphResult(`api/graph/${prepareArg(opt)}/count/nodes${readOnlyParam}`, toast, setIndicator) as { nodes?: number };

                if (result.nodes == null || !Number.isFinite(Number(result.nodes))) return "";

                return Number(result.nodes).toLocaleString();
            } catch {
                return "";
            }
        }, [toast, setIndicator, isReadOnly]);

    const loadEdgesCount = useCallback((opt: string) =>
        async () => {
            try {
                const readOnlyParam = isReadOnly ? '?readOnly=true' : '';
                const result = await getSSEGraphResult(`api/graph/${prepareArg(opt)}/count/edges${readOnlyParam}`, toast, setIndicator) as { edges?: number };

                if (result.edges == null || !Number.isFinite(Number(result.edges))) return "";

                return Number(result.edges).toLocaleString();
            } catch {
                return "";
            }
        }, [toast, setIndicator, isReadOnly]);

    const handleSetOption = useCallback(async (option: string, optionName: string) => {
        const result = await securedFetch(
            `api/graph/${prepareArg(option)}`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sourceName: optionName })
            },
            toast,
            setIndicator
        );

        if (result.ok) {
            const newOptions = options.map((opt) => (opt === optionName ? option : opt));
            setOptions!(newOptions);

            if (setSelectedValue && optionName === selectedValue) setSelectedValue(option);

            // Rebuild rows to reflect the updated option names
            setRows(newOptions.map((opt) => {
                const baseCell = sessionRole === "Admin"
                    ? { value: opt, onChange: (value: string) => handleSetOption(value, opt), type: "text" as const }
                    : { value: opt, type: "readonly" as const };

                const cells: Row["cells"] = [baseCell];

                if (showMemoryUsage) {
                    cells.push({ loadCell: loadMemory(opt), type: "readonly" });
                }

                cells.push(
                    { loadCell: loadNodesCount(opt), type: "readonly" },
                    { loadCell: loadEdgesCount(opt), type: "readonly" }
                );

                return {
                    checked: false,
                    name: opt,
                    cells
                };
            }));
        }

        return result.ok;
    }, [toast, setIndicator, options, setOptions, setSelectedValue, selectedValue, sessionRole, showMemoryUsage, loadNodesCount, loadEdgesCount, loadMemory]);

    const handleSetRows = useCallback((opts: string[]) => {
        setRows(opts.map((opt) => {
            const baseCell = sessionRole === "Admin"
                ? { value: opt, onChange: (value: string) => handleSetOption(value, opt), type: "text" as const }
                : { value: opt, type: "readonly" as const };

            const cells: Row["cells"] = [baseCell];

            if (showMemoryUsage) {
                cells.push({ loadCell: loadMemory(opt), type: "readonly" });
            }

            cells.push(
                { loadCell: loadNodesCount(opt), type: "readonly" },
                { loadCell: loadEdgesCount(opt), type: "readonly" }
            );

            return {
                checked: false,
                name: opt,
                cells
            };
        }));
    }, [sessionRole, handleSetOption, loadMemory, loadNodesCount, loadEdgesCount, showMemoryUsage, isReadOnly]);

    useEffect(() => {
        if (!openMenage) {
            setOpenDuplicate(false);
            handleSetRows(options);
        }
    }, [openMenage, handleSetRows, options]);

    useEffect(() => {
        handleSetRows(options);
    }, [options, handleSetRows]);

    const handleOpenChange = async (o: boolean) => {
        setOpen(o);

        if (!o || tutorialOpen) return;

        try {
            setIsLoading(true);
            await getOptions();
        } finally {
            setIsLoading(false);
        }
    };

    const handleClick = (value: string) => {
        setSelectedValue(value);
        setOpen(false);
    };

    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!openMenage) return undefined;
        const handler = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            if (inputRef.current === document.activeElement) return;
            setOpenMenage(false);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [openMenage]);

    return (
        <>
            <Popover open={open} onOpenChange={handleOpenChange}>
                <PopoverTrigger disabled={options.length === 0 || indicator === "offline"} asChild>
                    <Button
                        className="min-w-0 basis-0 grow bg-background rounded-lg border border-border p-2 justify-left disabled:text-gray-400 disabled:opacity-100 p-1 text-sm"
                        label={selectedValue || "Select Graph"}
                        title={options.length === 0 ? "There are no Graphs" : undefined}
                        indicator={indicator}
                        data-testid="selectGraph"
                    >
                        {
                            open ?
                                <ChevronUp className="min-w-4 min-h-4" />
                                :
                                <ChevronDown className="min-w-4 min-h-4" />
                        }
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="z-20 h-[40dvh] min-h-fit w-[350px] mt-2 overflow-hidden border border-border rounded-lg flex flex-col items-center p-2"
                    onInteractOutside={(e) => { if (openMenage || tutorialOpen) e.preventDefault(); }}
                    onEscapeKeyDown={(e) => { if (openMenage || tutorialOpen) e.preventDefault(); }}
                >
                    <PaginationList
                        className="basis-0 grow min-h-fit p-0"
                        list={options}
                        onClick={handleClick}
                        dataTestId="selectGraph"
                        label="Graph"
                        afterSearchCallback={() => { }}
                        isSelected={(value) => selectedValue === value}
                        isLoading={isLoading}
                        searchRef={inputRef}
                    />
                    <div className="flex gap-2">
                        <Button
                            className="w-fit px-2 py-1 text-xs"
                            variant="Primary"
                            label="Manage"
                            data-testid="manageGraphs"
                            onClick={() => { setOpenMenage(true); }}
                        >
                            <Settings size={16} />
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
            {
                mounted && openMenage && createPortal(
                    <ResizableBox
                        width={manageSize.width}
                        height={manageSize.height}
                        minWidth={400}
                        minHeight={300}
                        direction="bottom-right"
                        onResizeEnd={(w, h) => onManageResize(w, h)}
                        className="fixed top-16 left-3 z-30 flex flex-col gap-2 border border-border rounded-lg shadow-lg p-2 bg-background"
                        data-testid="manageContent"
                    >
                        <div
                            role="dialog"
                            aria-label="Manage Graphs"
                            className="h-full w-full flex flex-col gap-2"
                        >
                            <div className="flex flex-row justify-between items-center border-b border-border pb-1">
                                <h2 className="text-2xl font-medium flex items-center gap-2">
                                    Manage Graphs
                                    <Settings size={22} className="text-foreground/60" />
                                </h2>
                                <Button
                                    aria-label="Close"
                                    data-testid="closeManage"
                                    onClick={() => setOpenMenage(false)}
                                >
                                    <X />
                                </Button>
                            </div>
                            <TableComponent
                                className="grow overflow-hidden gap-2"
                                label="Graphs"
                                entityName="Graph"
                                headers={[
                                    "Name",
                                    ...(showMemoryUsage ? [{ name: "Memory Usage", width: "20%" }] : []),
                                    { name: "Nodes #", width: "10%" },
                                    { name: "Edges #", width: "10%" }
                                ]}
                                rows={rows}
                                setRows={setRows}
                                inputRef={inputRef}
                                itemHeight={24}
                            >
                                {
                                    !isReadOnly &&
                                    <>
                                        <DeleteGraph
                                            rows={rows.filter(opt => opt.checked)}
                                            selectedValue={selectedValue}
                                            setGraphName={setSelectedValue}
                                            setGraph={setGraph}
                                            setOpenMenage={setOpenMenage}
                                            graphNames={options}
                                            setGraphNames={setOptions}
                                        />
                                        <ExportGraph
                                            selectedValues={rows.filter(opt => opt.checked).map(opt => opt.cells[0].value as string)}
                                             
                                        />
                                        <UploadGraph
                                            graphName={rows.filter(opt => opt.checked).map(opt => opt.cells[0].value as string)[0] ?? ""}
                                            disabled={rows.filter(opt => opt.checked).length !== 1}
                                        />
                                        <DuplicateGraph
                                            selectedValue={rows.filter(opt => opt.checked).map(opt => opt.cells[0].value as string)[0]}
                                             
                                            open={openDuplicate}
                                            onOpenChange={setOpenDuplicate}
                                            onDuplicate={(duplicateName) => {
                                                setSelectedValue(duplicateName);
                                                setOptions!([...options, duplicateName]);
                                            }}
                                            disabled={rows.filter(opt => opt.checked).length !== 1}
                                        />
                                    </>
                                }
                            </TableComponent>
                        </div>
                    </ResizableBox>,
                    document.body
                )
            }
        </>
    );
}