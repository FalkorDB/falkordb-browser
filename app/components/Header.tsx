'use client'

// import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LifeBuoy, PlusCircle, Settings } from "lucide-react";
import { FormEvent, useState } from "react";
import Image from "next/image";
import { cn, prepareArg, securedFetch, Toast } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { Role } from "next-auth";
import Button from "./ui/Button";
import Avatar from "./ui/Avatar";
import CreateGraph from "./CreateGraph";

/* eslint-disable react/require-default-props */interface Props {
    onSetGraphName?: (graphName: string) => void
}
export default function Header({ onSetGraphName }: Props) {
    const [helpOpen, setHelpOpen] = useState<boolean>(false)
    const [createOpen, setCreateOpen] = useState<boolean>(false)
    const router = useRouter()
    const pathname = usePathname()
    const [userStatus, setUserStatus] = useState<Role>()
    const [graphName, setGraphName] = useState<string>("")
    const type = pathname.includes("/schema") ? "Schema" : "Graph"
    const inCreate = pathname.includes("/create")

    const handelCreateGraph = async (e: FormEvent<HTMLFormElement>) => {

        if (!onSetGraphName) return

        e.preventDefault()

        const name = `${graphName}${type === "Schema" ? "_schema" : ""}`

        const q = `RETURN 1`
        const result = await securedFetch(`api/graph/${prepareArg(name)}/?query=${prepareArg(q)}`, {
            method: "GET"
        })

        if (result.ok) {
            Toast(`${type} ${graphName} created successfully!`, "Success")
            onSetGraphName(graphName)
            setCreateOpen(false)
            setGraphName("")
        }
    }

    return (
        <div className="flex flex-col">
            <div className="py-5 px-10 flex justify-between items-center Header">
                <div className="flex gap-4 items-center">
                    <a
                        aria-label="FalkorDB"
                        href="https://www.falkordb.com"
                        target="_blank" rel="noreferrer"
                    >
                        <Image priority width={103} height={29} src="/ColorLogo.svg" alt="" />
                    </a>
                    <p className="text-neutral-200" >|</p>
                    <div className="flex gap-2 bg-foreground rounded-lg p-2">
                        <Button
                            label="Graphs"
                            className={cn("px-4 py-1 rounded-lg", pathname.includes("/graph") && "bg-background")}
                            onClick={() => router.push("/graph")}
                        />
                        <Button
                            label="Schemas"
                            className={cn("px-4 py-1 rounded-lg", pathname.includes("/schema") && "bg-background")}
                            onClick={() => router.push("/schema")}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-12">
                    {
                        !inCreate &&
                        <CreateGraph
                            open={createOpen}
                            setOpen={setCreateOpen}
                            trigger={
                                <Button
                                    variant="Primary"
                                    label={`Create New ${type}`}
                                    icon={<PlusCircle />}
                                />
                            }
                            graphName={graphName}
                            setGraphName={setGraphName}
                            handleCreateGraph={handelCreateGraph}
                        />
                    }
                    {/* <Dialog>
                            <DialogTrigger asChild>
                            </DialogTrigger>
                            <DialogContent displayClose className="flex flex-col gap-6">
                                <DialogHeader className="flex justify-between items-center">
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
                                        <div className="flex justify-center gap-4">
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
                    <DropdownMenu onOpenChange={setHelpOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                className="flex gap-1 items-center focus-visible:outline-none"
                                label="Help"
                                icon={<LifeBuoy size={20} />}
                                open={helpOpen}
                            />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>
                                <a
                                    className="w-full p-2 text-start"
                                    title="Documentation"
                                    href="https://docs.falkordb.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <p>Documentation</p>
                                </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <a
                                    className="w-full p-2 text-start"
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
                    <Button
                        label="Settings"
                        icon={<Settings size={25} />}
                        onClick={() => router.push("/settings")}
                        disabled={userStatus !== "Admin"}
                    />
                    <Avatar setUserStatus={setUserStatus} />
                </div>
            </div>
            <div className="h-2 Top" />
        </div>
    )
}
