import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import GraphsList from "./GraphList";
import { editor } from "monaco-editor";

export class QueryState {
    constructor(
        public query: string,
        public graphName: string,
    ) { }
}

const monacoOptions = {
    glyphMargin: false,
    lineDecorationsWidth: 0,
    folding: false,
    fixedOverflowWidgets: true,
    hover: {
        delay: 100,
    },
    roundedSelection: false,
    contextmenu: false,
    cursorStyle: "line-thin",
    occurrencesHighlight: false,
    links: false,
    minimap: { enabled: false },

    fontSize: 14,
    fontWeight: "normal",
    wordWrap: "off",
    lineNumbers: "off",
    lineNumbersMinChars: 0,
    overviewRulerLanes: 0,
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
    scrollBeyondLastColumn: 0,

};

export function Query({ onSubmit, onQueryUpdate, className = "" }: {
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<boolean>,
    onQueryUpdate: (state: QueryState) => void,
    className: string
}) {
    const lineHeight = 40
    const [query, setQuery] = useState('');
    const [graphName, setGraphName] = useState('');
    const { theme, systemTheme } = useTheme()
    const [monacoEditor, setMonacoEditor] = useState<editor.IStandaloneCodeEditor | null>(null)
    const darkmode = theme === "dark" || (theme === "system" && systemTheme === "dark")

    const getHeight = () => {
        switch (query.split("\n").length) {
            case 1: return lineHeight
            case 2: return lineHeight * 2
            case 3: return lineHeight * 3
            default: return lineHeight * 4
        }
    }

    const height = getHeight();

    useEffect(() => {
        if (monacoEditor) {
            const scrollLine = query.split("\n").length
            monacoEditor.setScrollPosition({ scrollTop: scrollLine });
        }
    }, [height])

    onQueryUpdate(new QueryState(query, graphName))

    return (
        <form
            className={cn("w-full flex xl:flex-row md:flex-col gap-2 items-center justify-center", className)}
            onSubmit={onSubmit}
        >
            <GraphsList onSelectedGraph={setGraphName} />
            <div className="w-1 h-fit grow">
                <Editor
                className="border rounded-lg overflow-hidden"
                    height={height}
                    value={query}
                    onChange={(val) => (val || val === "") && setQuery(val)}
                    onMount={(editor) => setMonacoEditor(editor)}
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
                        lineHeight: lineHeight,
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
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <Play />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Run Query</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </form>
    )
}