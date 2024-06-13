'use client'

// import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp, LifeBuoy, PlusCircle, Settings } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Button from "../components/Button";

export default function Header({ inCreate = false, inSettings = false }: {
    // eslint-disable-next-line react/require-default-props
    inCreate?: boolean
    // eslint-disable-next-line react/require-default-props
    inSettings?: boolean
}) {
    const [open, setOpen] = useState<boolean>(false)
    // const [newName, setNewName] = useState<string>("")

    // const createGraph = async () => {
    //     const result = await fetch(`api/graph/${newName}`)
    // }

    const run = () => {
        const query1 = `CREATE
            (:Rider {name:'Valentino Rossi'})-[:rides]->(:Team {name:'Yamaha'}),
            (:Rider {name:'Dani Pedrosa'})-[:rides]->(:Team {name:'Honda'}),
            (:Rider {name:'Andrea Dovizioso'})-[:rides]->(:Team {name:'Ducati'})`
        fetch(`api/graph/FalkorDB/?query=${query1.trim()}`, {
            method: "GET"
        })
        const query2 = `CREATE
            (:Rider {name:'string'})-[:rides]->(:Team {name:'string'})`
        fetch(`api/graph/FalkorDB-schema/?query=${query2.trim()}`, {
            method: "GET"
        })
    }

    return (
        <div className="h-[10%] flex flex-col">
            <div className="h-2 rounded-t-lg Top" />
            <div className="grow py-6 px-11 flex flex-row justify-between items-center Header">
                <div className="flex flex-row gap-4 items-center">
                    <Image width={103} height={29} src="/ColorLogo.svg" alt=""/>
                    <p className="text-neutral-200" >|</p>
                    <div className="flex flex-row gap-6">
                        <p>Knowledge Graphs</p>
                        <p>Schemas</p>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-8">
                    {
                        !inCreate &&
                        <>
                            <Button
                                className="text-white"
                                variant="Primary"
                                label="New Graph"
                                icon={<PlusCircle />}
                                onClick={() => run()}
                            />
                            {/* <Dialog>
                            <DialogTrigger asChild>
                            </DialogTrigger>
                            <DialogContent className="flex flex-col gap-6">
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
                            {
                                !inSettings &&
                                <DropdownMenu onOpenChange={setOpen}>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            className="flex flex-row gap-1 items-center focus-visible:outline-none"
                                            title="help"
                                            type="button"
                                        >
                                            <LifeBuoy size={20} />
                                            <p>Help</p>
                                            {
                                                open ?
                                                    <ChevronUp size={20} />
                                                    : <ChevronDown size={20} />
                                            }
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem asChild>
                                            <a
                                                title="Documentation"
                                                href="https://docs.falkordb.com/"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <p>Documentation</p>
                                            </a>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <a
                                                title="Support"
                                                href="https://www.falkordb.com/contact-us/"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <p>Support</p>
                                            </a>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            }
                        </>
                    }
                    <div>
                        <a
                        className="flex flex-row gap-2"
                            href="/settings"
                            title="Settings"
                            aria-label="Settings"
                        >
                            <p>Settings</p>
                            <Settings size={25} />
                        </a>
                    </div>
                    <div className="flex flex-row gap-4 items-center">
                        <span>user.name</span>
                        <div className="w-8 h-8 bg-red-800 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}