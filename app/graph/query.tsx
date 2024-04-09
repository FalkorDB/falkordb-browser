import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Menu, Play, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

    const handleDelete = () => {
        fetch(`/api/graph/${encodeURIComponent(graphName)}`, {
            method: 'DELETE',
        }).then(res => res.json()).then((data) => {
            toast({
                title: "Delete graph",
                description: data.message,
            })
            setOnDelete(prev => !prev)
            setGraphName('')
            onDeleteGraph()
        }).catch(err => {
            toast({
                title: "Error",
                description: (err as Error).message,
            })
        })
    }

    return (
        <form
            className={cn("flex flex-col gap-3 md:flex-row", className)}
            onSubmit={onSubmit}
        >
            <div className="items-center flex flex-row gap-3">
                <Label htmlFor="query" className="text">Query</Label>
                <GraphsList onDelete={onDelete} onSelectedGraph={setGraphName} />
            </div>
            <div className="flex flex-row gap-3 w-full">
                <Editor
                    value={query}
                    onChange={(val) => val && setQuery(val)}
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
                            <Button type="submit"><Play /></Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Run Query</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <AlertDialog>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button>
                            <Menu />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel className="flex justify-around">Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {graphName &&
                            <DropdownMenuItem className="flex justify-around">
                                <AlertDialogTrigger className="flex flex-row items-center gap-2">
                                    <Trash2 />
                                    <span>Delete graph</span>
                                </AlertDialogTrigger>
                            </DropdownMenuItem>
                        }
                    </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure you?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you absolutely sure you want to delete {graphName}?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete()}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </form>
    )
}