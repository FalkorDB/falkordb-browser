import { cn } from "@/lib/utils";
import { FormEvent, useEffect, useState } from "react";
import { Maximize, Menu, Play, Trash2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger, AlertDialogHeader, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import Combobox from "../components/combobox";

export default function MainQuery({ onSubmit, onDelete, className = "" }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSubmit: (e: FormEvent<HTMLFormElement>, graphName: string, query: string) => Promise<any>,
    onDelete: (graphName: string) => void,
    className: string,
}) {
    const lineHeight = 40
    const [query, setQuery] = useState<string>("");
    const [graphName, setGraphName] = useState("");
    const { theme, systemTheme } = useTheme()
    const darkmode = theme === "dark" || (theme === "system" && systemTheme === "dark")
    const [graphs, setGraphs] = useState<string[]>([]);
    const { toast } = useToast()

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
        fetch('/api/graph', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((result) => {
            if (result.status < 300) {
                return result.json()
            }
            toast({
                title: "Error",
                description: result.text(),
            })
            return { result: [] }
        }).then((result) => {
            setGraphs(result.result.graphs ?? [])
        })
    }, [toast])

    const handelDelete = (name: string) => {
        setGraphName('')
        onDelete(name)
        setGraphs((prevGraphs: string[]) => [...prevGraphs.filter(graph => graph !== name)]);
        fetch(`/api/graph/${encodeURIComponent(name)}`, {
            method: 'DELETE',
        }).then(() =>
            toast({
                title: 'Graph Deleted',
                description: `Graph ${name} deleted`,
            })
        ).catch((error) => {
            toast({
                title: "Error",
                description: error.message,
            })
        })
    }

    const addOption = (newGraph: string) => {
        setGraphs((prevGraphs: string[]) => [...prevGraphs, newGraph]);
        setGraphName(newGraph)
    }

    return (
        <form
            className={cn("w-full flex xl:flex-row md:flex-col gap-2 items-start", className)}
            onSubmit={async (e: FormEvent<HTMLFormElement>) => {
                await onSubmit(e, graphName, query)
                setQuery("")
            }}
        >
            <Combobox addOption={addOption} options={graphs} selectedValue={graphName} setSelectedValue={setGraphName} />
            <div className="w-1 grow relative">
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
                <Dialog>
                    <DialogTrigger asChild>
                        <button title="Maximize" className="absolute top-2 right-2" type="button">
                            {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                            <Maximize />
                        </button>
                    </DialogTrigger>
                    <DialogContent className="h-4/5 max-w-[80%]">
                        <Editor
                            value={query}
                            onChange={(val) => val && setQuery(val)}
                            theme={`${darkmode ? "vs-dark" : "light"}`}
                            language="cypher"
                        />
                    </DialogContent>
                </Dialog >
            </div>
            <button title="Run Query" className="pt-2" type="submit">
                {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                <Play />
            </button>
            {
                graphName &&
                <AlertDialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger title="menu" className="pt-2 focus-visible:outline-none">
                            <Menu />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel className="text-center">
                                <h1>Actions</h1>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <AlertDialogTrigger className="w-full flex flex-row justify-around gap-4">
                                    <span>Delete</span>
                                    <Trash2 />
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure you?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you absolutely sure you want to delete {graphName}?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handelDelete(graphName)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </AlertDialog>
            }
        </form >
    )
}