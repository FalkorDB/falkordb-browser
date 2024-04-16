import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Maximize, Play } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { editor } from "monaco-editor";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import GraphsList from "./GraphList";

export class QueryState {
    constructor(
        public query: string | undefined,
        public graphName: string,
    ) { }
}

export function Query({ onSubmit, onQueryUpdate, onDelete, className = "" }: {
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<boolean>,
    onQueryUpdate: (state: QueryState) => void,
    onDelete: () => void,
    className: string
}) {
    const lineHeight = 40
    const [query, setQuery] = useState<string | undefined>();
    const [graphName, setGraphName] = useState('');
    const { theme, systemTheme } = useTheme()
    const [monacoEditor, setMonacoEditor] = useState<editor.IStandaloneCodeEditor | null>(null)
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

    useEffect(() => {
        if (monacoEditor) {
            const scrollLine = query?.split("\n").length || lineHeight
            monacoEditor.setScrollPosition({ scrollTop: scrollLine });
        }
    }, [height])

    onQueryUpdate(new QueryState(query, graphName))

    return (
        <Dialog>
            <form
                className={cn("w-full flex xl:flex-row md:flex-col gap-2 items-start", className)}
                onSubmit={onSubmit}
            >
                <GraphsList onDelete={onDelete} onSelectedGraph={setGraphName} />
                <div className="w-1 h-fit grow">
                    <Editor
                        className="border rounded-lg overflow-hidden"
                        height={height}
                        value={query}
                        onChange={setQuery}
                        onMount={setMonacoEditor}
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
                <div className="h-10 flex justify-center gap-2">
                    <DialogTrigger asChild>
                        <button title="Maximize" type="button">
                            { /* eslint-disable jsx-a11y/control-has-associated-label */}
                            <Maximize />
                        </button>
                    </DialogTrigger>
                    <DialogContent className="h-[80%] max-w-[80%]">
                        <Editor
                            value={query}
                            onChange={setQuery}
                            theme={`${darkmode ? "vs-dark" : "light"}`}
                            language="cypher"
                        />
                    </DialogContent>
                    <button title="Run Query" type="submit">
                        { /* eslint-disable jsx-a11y/control-has-associated-label */}
                        <Play />
                    </button>
                </div>
            </form>
        </Dialog>
    )
}