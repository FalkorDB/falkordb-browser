import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Menu, Search, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import GraphsList from "./GraphList";


export class QueryState {
    constructor(
        public query: string,
        public graphName: string,
    ) { }
}

export function Query({ onSubmit, onQueryUpdate, className = "" }: {
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void,
    onQueryUpdate: (state: QueryState) => void,
    className: string
}) {
    const [query, setQuery] = useState('');
    const [graphName, setGraphName] = useState('');
    const [onDelete, setOnDelete] = useState<boolean>(false);
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
        }).catch(err => {
            toast({
                title: "Error",
                description: (err as Error).message,
            })
        })
    }

    return (
        <form
            className={cn("flex flex-col space-y-3 md:flex-row md:space-x-3 md:space-y-0", className)}
            onSubmit={onSubmit}>
            <div className="items-center flex flex-row space-x-3">
                <Label htmlFor="query" className="text">Query</Label>
                <GraphsList onDelete={onDelete} onSelectedGraph={setGraphName} />
            </div>
            <div className="flex flex-row space-x-3 w-full md:w-8/12 items-center">
                <Input id="query" className="border-gray-500 w-full"
                    placeholder="MATCH (n)-[e]-() RETURN n,e limit 100" type="text" onChange={(event) => setQuery(event.target.value)} />
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button type="submit" className="mr-16"><Search /></Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Query</p>
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
                                <AlertDialogTrigger className="flex flex-row items-center gap-x-2">
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