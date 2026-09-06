import { useContext, useEffect, useRef, useState } from "react";
import { Braces, ChevronDown, ChevronRight } from "lucide-react";
import { cn, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { IndicatorContext, UDFContext } from "../components/provider";
import LoadUDF from "./LoadUdf";
import FlushUDFs from "./FlushUdfs";
import DeleteUDF from "./DeleteUdf";

function LibrarySection({
    libraryName,
    libraryFunctionCount,
    functions,
    isSelected,
    isExpanded,
    onToggleExpand,
    onSelect,
    onFunctionSelect,
    onDelete,
}: {
    libraryName: string
    libraryFunctionCount: number
    functions: string[]
    isSelected: boolean
    isExpanded: boolean
    onToggleExpand: () => void
    onSelect: () => void
    onFunctionSelect: (functionName: string) => void
    onDelete: () => void
}) {
    const iconSize = 16;

    return (
        <div className={cn("flex flex-col gap-2", isExpanded && "min-h-[40%] h-fit")}>
            <div
                className={cn(
                    "flex items-center gap-2 w-full text-left text-xs font-medium py-1 px-1 rounded hover:bg-secondary",
                    isSelected && "bg-secondary text-primary"
                )}
            >
                <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-label={`Toggle ${libraryName} functions`}
                    onClick={onToggleExpand}
                    className="flex items-center gap-1"
                >
                    {isExpanded ? <ChevronDown size={iconSize} /> : <ChevronRight size={iconSize} />}
                </button>
                <button
                    className="basis-0 grow flex justify-between items-center"
                    type="button"
                    onClick={() => {
                        onSelect();
                    }}
                >
                    <span className="truncate font-bold">{libraryName}</span>
                    <span className="text-xs text-muted-foreground ml-auto shrink-0">{libraryFunctionCount}</span>
                </button>
                <DeleteUDF iconSize={iconSize} udfName={libraryName} onDelete={onDelete} />
            </div>
            {isExpanded && (
                <div className="flex flex-col ml-5 overflow-y-auto">
                    {functions.map((fn) => (
                        <button
                            key={fn}
                            className="text-left min-h-fit text-xs py-0.5 px-1 text-muted-foreground truncate hover:bg-secondary rounded"
                            title={fn}
                            type="button"
                            onClick={() => onFunctionSelect(fn)}
                        >
                            {fn}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function UdfPanel() {
    const { udfList, setUdfList, selectedUdf, setSelectedUdf, setSelectedUdfFunction } = useContext(UDFContext);
    const { setIndicator } = useContext(IndicatorContext);
    const { toast } = useToast();
    const [selectedLib, setSelectedLib] = useState<string | undefined>(selectedUdf?.[1]);
    const [expandedLib, setExpandedLib] = useState<string | undefined>(selectedUdf?.[1]);
    const functionRequestIdRef = useRef(0);
    // Guards against an older library fetch resolving after a newer pick.
    const libRequestIdRef = useRef(0);
    // `selectedLib` is optimistic; this is the library the editor actually shows.
    const committedLibRef = useRef(selectedUdf?.[1]);

    const selectFunction = (functionName: string) => {
        functionRequestIdRef.current += 1;
        setSelectedUdfFunction({ name: functionName, requestId: functionRequestIdRef.current });
    };

    useEffect(() => {
        committedLibRef.current = selectedUdf?.[1];
        setSelectedLib(selectedUdf?.[1]);
        setExpandedLib(selectedUdf?.[1]);
    }, [selectedUdf]);

    /** Resolves to false when the library did not become the selection: failed, or superseded by a newer pick. */
    const handleSelectLib = async (libraryName: string): Promise<boolean> => {
        if (selectedLib === libraryName) return true;

        libRequestIdRef.current += 1;
        const requestId = libRequestIdRef.current;

        setSelectedLib(libraryName);
        setSelectedUdfFunction(undefined);

        // The editor still shows the committed library, so both the highlight and the
        // open section go back to it — never to whatever the last optimistic pick was.
        const rollback = () => {
            if (libRequestIdRef.current !== requestId) return;

            setSelectedLib(committedLibRef.current);
            setExpandedLib(committedLibRef.current);
        };

        try {
            const res = await securedFetch(`/api/udf/${encodeURIComponent(libraryName)}`, {
                method: "GET",
            }, toast, setIndicator);

            if (!res.ok) {
                rollback();
                return false;
            }

            const data = await res.json();

            if (libRequestIdRef.current !== requestId) return false;

            setSelectedUdf(data.result[0]);

            return true;
        } catch {
            // A superseded request must stay silent: the pick the user moved on to
            // owns both the highlight and any error message.
            if (libRequestIdRef.current !== requestId) return false;

            rollback();
            toast({
                title: "Error",
                description: `Failed to load the library ${libraryName}`,
                variant: "destructive",
            });
            return false;
        }
    };

    const handleLoad = async (name: string) => {
        // Claim the id before awaiting, so a library pick that is already in
        // flight cannot still consider itself current and overwrite the load.
        libRequestIdRef.current += 1;
        const requestId = libRequestIdRef.current;

        // That claim also silenced any pick still in flight, so a failure here has
        // to put the highlight back on the library the editor is actually showing.
        const abandon = () => {
            if (libRequestIdRef.current !== requestId) return;

            setSelectedLib(committedLibRef.current);
            setExpandedLib(committedLibRef.current);
        };

        try {
            const res = await securedFetch(`/api/udf/${encodeURIComponent(name)}`, {
                method: "GET",
            }, toast, setIndicator);

            if (!res.ok) {
                abandon();
                return;
            }

            const data = await res.json();

            if (libRequestIdRef.current !== requestId) return;

            const loaded = data.result[0];
            const loadedName = loaded[1];
            setUdfList((prev) => {
                const filtered = prev.filter(([, libName]) => libName !== loadedName);
                return [...filtered, loaded];
            });
            setSelectedLib(loadedName);
            setSelectedUdf(loaded);
            setSelectedUdfFunction(undefined);
        } catch {
            if (libRequestIdRef.current !== requestId) return;

            abandon();
            toast({
                title: "Error",
                description: `Failed to load the library ${name}`,
                variant: "destructive",
            });
        }
    };

    return (
        <div className="relative h-full w-full p-2 flex flex-col gap-2 border-r border-border overflow-hidden">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl">UDF Libraries</h1>
                <Braces size={25} />
            </div>
            <div className="flex gap-2">
                <LoadUDF onLoad={handleLoad} />
                <FlushUDFs
                    onFlush={() => {
                        libRequestIdRef.current += 1;
                        setUdfList([]);
                        setSelectedLib(undefined);
                        setSelectedUdf(undefined);
                        setSelectedUdfFunction(undefined);
                        setExpandedLib(undefined);
                    }}
                />
            </div>
            <h2 className="text-sm font-semibold text-muted-foreground">Libraries</h2>
            {
                udfList.length > 0 && (
                    <div className="basis-0 grow flex flex-col gap-2 overflow-y-auto">
                        {udfList.map(([, libraryName, , functions]) => (
                            <LibrarySection
                                key={libraryName}
                                libraryName={libraryName}
                                libraryFunctionCount={functions.length}
                                functions={functions}
                                isSelected={selectedLib === libraryName}
                                isExpanded={expandedLib === libraryName}
                                onToggleExpand={() => {
                                    const shouldOpen = expandedLib !== libraryName;
                                    setExpandedLib(shouldOpen ? libraryName : undefined);
                                    if (shouldOpen) {
                                        void handleSelectLib(libraryName);
                                    }
                                }}
                                onSelect={() => handleSelectLib(libraryName)}
                                onFunctionSelect={(functionName) => {
                                    void handleSelectLib(libraryName).then((isCurrent) => {
                                        if (isCurrent) selectFunction(functionName);
                                    });
                                }}
                                onDelete={() => {
                                    setUdfList((prev) => prev.filter(([, name]) => name !== libraryName));

                                    if (selectedLib === libraryName) {
                                        libRequestIdRef.current += 1;
                                        setSelectedLib(undefined);
                                        setSelectedUdf(undefined);
                                        setSelectedUdfFunction(undefined);
                                    }
                                    if (expandedLib === libraryName) {
                                        setExpandedLib(undefined);
                                    }
                                }}
                            />
                        ))}
                    </div>
                )
            }
        </div>
    );
}
