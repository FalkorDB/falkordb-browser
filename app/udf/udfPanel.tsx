import { useContext, useEffect, useState } from "react";
import { Braces, ChevronDown, ChevronRight, X } from "lucide-react";
import { cn, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import Button from "../components/ui/Button";
import { IndicatorContext, UDFContext } from "../components/provider";
import LoadUDF from "./LoadUdf";
import FlushUDFs from "./FlushUdfs";
import DeleteUDF from "./DeleteUdf";

interface UdfPanelProps {
    onClose: () => void
}

function LibrarySection({ libraryName, libraryType, functions, isSelected, onSelect, onDelete }: {
    libraryName: string
    libraryType: string
    functions: string[]
    isSelected: boolean
    onSelect: () => void
    onDelete: () => void
}) {
    const [open, setOpen] = useState(false);
    const iconSize = 25;

    return (
        <div className="flex flex-col gap-2">
            <div
                className={cn(
                    "flex items-center gap-2 w-full text-left text-sm font-medium py-1 px-1 rounded hover:bg-secondary",
                    isSelected && "bg-secondary text-primary"
                )}
            >
                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className="flex items-center gap-1"
                >
                    {open ? <ChevronDown size={iconSize} /> : <ChevronRight size={iconSize} />}
                </button>
                <button
                    className="basis-0 grow flex justify-between items-center"
                    type="button"
                    onClick={() => {
                        onSelect();
                    }}
                >
                    <span className="truncate font-bold">{libraryName}</span>
                    <span className="text-xs text-muted-foreground ml-auto shrink-0">{libraryType}</span>
                </button>
                <DeleteUDF iconSize={iconSize} udfName={libraryName} onDelete={onDelete} />
            </div>
            {open && (
                <div className="flex flex-col ml-5">
                    {functions.map((fn) => (
                        <p
                            key={fn}
                            className="text-sm py-0.5 px-1 text-muted-foreground truncate"
                            title={fn}
                        >
                            {fn}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function UdfPanel({ onClose }: UdfPanelProps) {
    const { udfList, setUdfList, selectedUdf, setSelectedUdf } = useContext(UDFContext);
    const { setIndicator } = useContext(IndicatorContext);
    const { toast } = useToast();
    const [selectedLib, setSelectedLib] = useState<string | undefined>(selectedUdf?.[1]);

    useEffect(() => {
        setSelectedLib(selectedUdf?.[1]);
    }, [selectedUdf]);

    const handleSelectLib = async (libraryName: string) => {
        if (libraryName === selectedLib) {
            setSelectedLib(undefined);
            setSelectedUdf(undefined);
            return;
        }

        setSelectedLib(libraryName);

        const res = await securedFetch(`/api/udf/${encodeURIComponent(libraryName)}`, {
            method: "GET",
        }, toast, setIndicator);

        if (!res.ok) return;

        const data = await res.json();

        setSelectedUdf(data.result[0]);
    };

    const handleLoad = async (name: string) => {
        const res = await securedFetch(`/api/udf/${encodeURIComponent(name)}`, {
            method: "GET",
        }, toast, setIndicator);

        if (!res.ok) return;

        const data = await res.json();
        const loaded = data.result[0];
        const loadedName = loaded[1];
        setUdfList((prev) => {
            const filtered = prev.filter(([, libName]) => libName !== loadedName);
            return [...filtered, loaded];
        });
        setSelectedLib(loadedName);
        setSelectedUdf(loaded);
    };

    return (
        <div className="relative h-full w-full p-2 flex flex-col gap-4 border-r border-border overflow-auto">
            <Button
                className="absolute top-2 right-2"
                title="Close"
                onClick={onClose}
            >
                <X className="h-4 w-4" />
            </Button>
            <div className="flex justify-between pr-6">
                <h1 className="text-2xl">UDF Libraries</h1>
                <Braces size={25} />
            </div>
            <div className="flex gap-2">
                <LoadUDF onLoad={handleLoad} />
                <FlushUDFs
                    onFlush={() => {
                        setUdfList([]);
                        setSelectedLib(undefined);
                        setSelectedUdf(undefined);
                    }}
                />
            </div>
            {udfList.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h2 className="text-sm font-semibold text-muted-foreground">Libraries</h2>
                    {udfList.map(([, libraryName, , functions]) => (
                        <LibrarySection
                            key={libraryName}
                            libraryName={libraryName}
                            libraryType={functions.length.toString()}
                            functions={functions}
                            isSelected={selectedLib === libraryName}
                            onSelect={() => handleSelectLib(libraryName)}
                            onDelete={() => {
                                setUdfList(udfList.filter(([, name]) => name !== libraryName));

                                if (selectedLib === libraryName) {
                                    setSelectedLib(undefined);
                                    setSelectedUdf(undefined);
                                }
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
