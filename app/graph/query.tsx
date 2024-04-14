import { cn } from "@/lib/utils";
import { useState } from "react";
import { Play } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import GraphsList from "./GraphList";

export class QueryState {
    constructor(
        public query: string,
        public graphName: string,
    ) { }
}

export function Query({ onSubmit, onQueryUpdate, onDeleteGraph, className = "" }: {
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<boolean>,
    onQueryUpdate: (state: QueryState) => void,
    onDeleteGraph: () => void,
    className: string
}) {
    const [query, setQuery] = useState('');
    const [graphName, setGraphName] = useState('');
    const [onDelete, setOnDelete] = useState<boolean>(false);
    const { theme, systemTheme } = useTheme()
    const darkmode = theme === "dark" || (theme === "system" && systemTheme === "dark")
    const { toast } = useToast();

    onQueryUpdate(new QueryState(query, graphName))

    return (
        <form
            className={cn("w-full flex xl:flex-row md:flex-col gap-2 items-center justify-center", className)}
            onSubmit={onSubmit}
        >
            <GraphsList onDelete={onDelete} onSelectedGraph={setGraphName} />
            <Editor
                value={query}
                onChange={(val) => (val || val === "") && setQuery(val)}
                theme={`${darkmode ? "vs-dark" : "light"}`}
                language="cypher"
                options={{
                    suggest: {
                        showKeywords: true,
                    },
                    minimap: { enabled: false },
                    wordWrap: "on",
                    lineNumbers: "off",
                    lineHeight: 40,
                    fontSize: 30,
                }}
            />
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button type="submit"><Play /></button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Run Query</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </form>
    )
}