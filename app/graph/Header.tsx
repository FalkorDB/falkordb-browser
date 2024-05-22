'use client'

// import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { BadgeHelp, ChevronDown, ChevronUp, Settings } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function Header({ inCreate }: {
    // eslint-disable-next-line react/require-default-props
    inCreate?: boolean
}) {
    const [open, setOpen] = useState<boolean>(false)
    // const [newName, setNewName] = useState<string>("")

    // const createGraph = async () => {
    //     const result = await fetch(`api/graph/${newName}`)
    // }

    const run = () => {
        const query = `CREATE
            (:Rider {name:'Valentino Rossi'})-[:rides]->(:Team {name:'Yamaha'}),
            (:Rider {name:'Dani Pedrosa'})-[:rides]->(:Team {name:'Honda'}),
            (:Rider {name:'Andrea Dovizioso'})-[:rides]->(:Team {name:'Ducati'})`
        fetch(`api/graph/FalkorDB/?query=${query.trim()}`, {
            method: "GET"
        })
    }

    return (
        <div className="h-[10%] border-b-[1px] border-[#ECECEC] p-8 flex flex-row justify-between items-center">
            <Image width={108} height={30} src="FalkorDB.png" alt="" />
            <div className="flex flex-row items-center gap-8">
                {
                    !inCreate &&
                    <>
                        <button
                            className="border rounded-lg border-indigo-600 p-2"
                            title="Add Graph"
                            type="button"
                            onClick={() => run()}
                        >
                            <p className="text-xs text-indigo-600">+ NEW GRAPH</p>
                        </button>
                        {/* <Dialog>
                            <DialogTrigger asChild>
                            </DialogTrigger>
                            <DialogContent displayClose={false} className="flex flex-col gap-6">
                                <DialogHeader className="flex flex-row justify-between items-center">
                                    <DialogTitle>Create New Graph</DialogTitle>
                                    <DialogClose asChild>
                                        <button
                                            title="Close"
                                            type="button"
                                            aria-label="close"
                                        >
                                            <X />
                                        </button>
                                    </DialogClose>
                                </DialogHeader>
                                <DialogDescription>
                                    do you want to upload data or empty graph ?
                                </DialogDescription>
                                <div className="flex flex-row justify-center gap-4">
                                    <DialogClose asChild>
                                        <a
                                            className="bg-indigo-600 text-white p-4"
                                            href="/create"
                                            title="Upload Data"
                                        >
                                            <p>Upload Data</p>
                                        </a>
                                    </DialogClose>
                                    <DialogClose asChild>
                                        <button
                                            className="bg-indigo-600 text-white p-4"
                                            title="Empty Graph"
                                            type="button"
                                        // onClick={() => createGraph()}
                                        >
                                            <p>Empty Graph</p>
                                        </button>
                                    </DialogClose>
                                </div>
                            </DialogContent>
                        </Dialog> */}

                        <DropdownMenu onOpenChange={setOpen}>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="flex flex-row gap-1 items-center focus-visible:outline-none"
                                    title="help"
                                    type="button"
                                >
                                    <BadgeHelp className="text-gray-400 text-opacity-70" size={20} />
                                    <p className="text-gray-400 text-opacity-70" >help</p>
                                    {
                                        open ?
                                            <ChevronUp className="text-gray-400 text-opacity-70" size={20} />
                                            : <ChevronDown className="text-gray-400 text-opacity-70" size={20} />
                                    }
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-white">
                                <DropdownMenuItem asChild>
                                    <button
                                        title="Tutorial"
                                        type="button"
                                    >
                                        <p className="text-gray-700 text-opacity-60">Tutorial</p>
                                    </button>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <button
                                        title="Documentation"
                                        type="button"
                                    >
                                        <p className="text-gray-700 text-opacity-60">Documentation</p>
                                    </button>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <button
                                        title="Support"
                                        type="button"
                                    >
                                        <p className="text-gray-700 text-opacity-60">Support</p>
                                    </button>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                }
                <div>
                    <button
                        title="Settings"
                        type="button"
                        aria-label="Settings"
                    >
                        <Settings className="text-gray-400 text-opacity-70" size={25} />
                    </button>
                </div>
                <div className="flex flex-row gap-4 items-center">
                    <span>user.name</span>
                    <div className="w-8 h-8 bg-red-800 rounded-full" />
                </div>
            </div>
        </div>
    )
}