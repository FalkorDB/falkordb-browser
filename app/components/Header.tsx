'use client'

// import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp, LifeBuoy, PlusCircle, Settings } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { cn, prepareArg, securedFetch } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { Role } from "next-auth";
import Button from "./Button";
import Avatar from "./Avatar";

/* eslint-disable react/require-default-props */
interface Props {
    graphName?: string
    inCreate?: boolean
    inSettings?: boolean
}

export default function Header({ graphName, inCreate = false, inSettings = false }: Props) {
    const [open, setOpen] = useState<boolean>(false)
    const router = useRouter()
    const pathname = usePathname()
    const [userStatus, setUserStatus] = useState<Role>()

    // const [newName, setNewName] = useState<string>("")

    // const createGraph = async () => {
    //     const result = await securedFetch(`api/graph/${newName}`)
    // }

    const run = () => {
        const query1 = `CREATE
            (:Rider {name:'Valentino Rossi'})-[:rides]->(:Team {name:'Yamaha'}),
            (:Rider {name:'Dani Pedrosa'})-[:rides]->(:Team {name:'Honda'}),
            (:Rider {name:'Andrea Dovizioso'})-[:rides]->(:Team {name:'Ducati'})`
        securedFetch(`api/graph/FalkorDB/?query=${prepareArg(query1)}`, {
            method: "GET"
        })
        const query2 = `CREATE
            (:Rider {name:'string'})-[:rides]->(:Team {name:'string'})`
        securedFetch(`api/graph/FalkorDB_schema/?query=${prepareArg(query2)}`, {
            method: "GET"
        })
    }

    return (
        <div className="h-[10%] flex flex-col">
            <div className="h-2 rounded-t-lg Top" />
            <div className="py-6 px-11 flex flex-row justify-between items-center Header">
                <div className="flex flex-row gap-4 items-center">
                    <Image width={103} height={29} src="/ColorLogo.svg" alt="" />
                    <p className="text-neutral-200" >|</p>
                    <div className="flex flex-row gap-6">
                        <Button
                            label="Graphs"
                            className={cn(pathname.includes("/graph") && "text-[#7167F6]")}
                            onClick={() => router.push("/graph")}
                        />
                        <Button
                            label="Schemas"
                            className={cn(pathname.includes("/schema") && "text-[#7167F6]")}
                            onClick={() => router.push("/schema")}
                        />
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
                            <DialogContent displayClose className="flex flex-col gap-6">
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
                                        {/* <Button 
                                            className="flex flex-row gap-1 items-center focus-visible:outline-none"
                                            label="help"
                                            icon={<LifeBuoy size={20} />}
                                            open={open}
                                        /> */}
                                        <button
                                            className="flex flex-row gap-1 items-center focus-visible:outline-none"
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
                    <Button
                        className={cn("flex flex-row gap-2", !graphName && "text-[#57577B]")}
                        label="Settings"
                        icon={<Settings size={25} />}
                        onClick={() => router.push("/settings")}
                        disabled={userStatus !== "Admin"}
                    />
                    <Avatar setUserStatus={setUserStatus} />
                </div>
            </div>
        </div>
    )
}