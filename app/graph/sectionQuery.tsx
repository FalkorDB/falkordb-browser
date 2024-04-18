import { cn } from "@/lib/utils";
import { FormEvent, useState } from "react";
import { Play } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";

export class GraphState {

    public static count: number = 0;

    public id: number;

    constructor(
        public graphName: string,
        public query: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public data?: any,
    ) {
        this.id = GraphState.count;
        GraphState.count += 1;
    }
}

export default function SectionQuery({ onSubmit, queryState, className = "" }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSubmit: (e: FormEvent<HTMLFormElement>, graphName: string, query: string) => Promise<any>,
    queryState: GraphState,
    className: string,
}) {
    const lineHeight = 40
    const { graphName } = queryState
    const [query, setQuery] = useState<string>(queryState.query);
    const { theme, systemTheme } = useTheme()
    const darkmode = theme === "dark" || (theme === "system" && systemTheme === "dark")

    const getHeight = () => {
        if (!query) return lineHeight
        switch (query.split("\n").length) {
            case 1: return lineHeight
            case 2: return lineHeight * 2
            case 3: return lineHeight * 3
            default: return lineHeight * 4
        }
    }

    const height = getHeight();

    return (
        <form
            className={cn("w-full flex xl:flex-row md:flex-col gap-2 items-start", className)}
            onSubmit={async (e: FormEvent<HTMLFormElement>) => {
                await onSubmit(e, graphName, query)
            }}
        >
            <span>{graphName}</span>
            <div className="w-1 grow">
                <Editor
                    className="border rounded-lg overflow-hidden"
                    height={height}
                    value={query}
                    onChange={(val) => val && setQuery(val)}
                    theme={`${darkmode ? "vs-dark" : "light"}`}
                    language="cypher"
                    options={{
                        lineDecorationsWidth: 10,
                        lineNumbersMinChars: 2,
                        scrollBeyondLastLine: false,
                        suggest: {
                            showKeywords: true,
                        },
                        minimap: { enabled: false },
                        wordWrap: "on",
                        lineHeight,
                        fontSize: 30,
                        find: {
                            addExtraSpaceOnTop: false,
                            autoFindInSelection: "never",
                            seedSearchStringFromSelection: "never",
                        },
                        scrollbar: {
                            horizontal: "hidden",
                        },
                    }}
                />
            </div>
            <button title="Run Query" className="pt-2" type="submit">
                {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                <Play />
            </button>
        </form >
    )
}