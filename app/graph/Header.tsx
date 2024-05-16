'use client'

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { BadgeHelp, ChevronDown, ChevronUp, Settings, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function Header({ inCreate }: {
    // eslint-disable-next-line react/require-default-props
    inCreate?: boolean
}) {

    const iconColor = "#C0C0D0"
    const iconSize = 20
    const [open, setOpen] = useState<boolean>(false)
    const [newName, setNewName] = useState<string>("")

    const createGraph = async () => {
        const result = await fetch(`api/graph/${newName}`)
    }

    return (
        <div className="h-[10%] border-b-[1px] border-[#ECECEC] p-8 flex flex-row justify-between items-center">
            <Image width={108} height={30} src="FalkorDB.png" alt="" />
            <div className="flex flex-row items-center gap-8">
                {
                    !inCreate &&
                    <>
                        <Dialog>
                            <DialogTrigger asChild>
                                <button
                                    className="border rounded-lg border-[#5D5FEF] p-2"
                                    title="Add Graph"
                                    type="button"
                                >
                                    <p className="text-xs text-[#5D5FEF]">+ NEW GRAPH</p>
                                </button>
                            </DialogTrigger>
                            <DialogContent displayClose={false} className="flex flex-col gap-6">
                                <DialogHeader className="flex flex-row justify-between items-center">
                                    <DialogTitle>Create New Graph</DialogTitle>
                                    <DialogClose asChild>
                                        <button
                                            title="close"
                                            type="button"
                                            aria-label="close"
                                        >
                                            <X/>
                                        </button>
                                    </DialogClose>
                                </DialogHeader>
                                <DialogDescription>
                                    do you want to upload data or empty graph ?
                                </DialogDescription>
                                <div className="flex flex-row justify-center gap-4">
                                    <DialogClose asChild>
                                        <a
                                            className="bg-blue-800 text-white p-4"
                                            href="/create"
                                            title="Upload Data"
                                        >
                                            <p>Upload Data</p>
                                        </a>
                                    </DialogClose>
                                    <DialogClose asChild>
                                        <button
                                            className="bg-blue-800 text-white p-4"
                                            title="Empty Graph"
                                            type="button"
                                            onClick={() => createGraph()}
                                        >
                                            <p>Empty Graph</p>
                                        </button>
                                    </DialogClose>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <DropdownMenu onOpenChange={setOpen}>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="flex flex-row gap-1 items-center focus-visible:outline-none"
                                    title="help"
                                    type="button"
                                >
                                    <BadgeHelp color={iconColor} size={iconSize} />
                                    <p className="text-[#C0C0D0]">help</p>
                                    {
                                        open ?
                                            <ChevronUp color={iconColor} size={iconSize} />
                                            : <ChevronDown color={iconColor} size={iconSize} />
                                    }
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-white">
                                <DropdownMenuItem asChild>
                                    <button
                                        title="Tutorial"
                                        type="button"
                                    >
                                        <p className="text-[#C0C0D0]">Tutorial</p>
                                    </button>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <button
                                        title="Documentation"
                                        type="button"
                                    >
                                        <p className="text-[#C0C0D0]">Documentation</p>
                                    </button>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <button
                                        title="Support"
                                        type="button"
                                    >
                                        <p className="text-[#C0C0D0]">Support</p>
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
                        <Settings color={iconColor} size={iconSize + 5} />
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