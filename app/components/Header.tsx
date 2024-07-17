'use client'

// import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LifeBuoy, PlusCircle, Settings } from "lucide-react";
import { FormEvent, useState } from "react";
import Image from "next/image";
import { Toast, cn, prepareArg, securedFetch } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { Role } from "next-auth";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import Button from "./ui/Button";
import Avatar from "./ui/Avatar";
import DialogComponent from "./DialogComponent";
import Input from "./ui/Input";

/* eslint-disable react/require-default-props */
interface Props {
    inCreate?: boolean
    inSettings?: boolean
    onSetGraphName?: (graphName: string) => void
}

export default function Header({ inCreate = false, inSettings = false, onSetGraphName }: Props) {
    const [helpOpen, setHelpOpen] = useState<boolean>(false)
    const [createOpen, setCreateOpen] = useState<boolean>(false)
    const router = useRouter()
    const pathname = usePathname()
    const [userStatus, setUserStatus] = useState<Role>()
    const [graphName, setGraphName] = useState<string>("")

    // const createGraph = async () => {
    //     const result = await securedFetch(`api/graph/${newName}`)
    // }

    const handelCreateGraph = async (e: FormEvent) => {
        
        
        if (!onSetGraphName) return
        e.preventDefault()

        const q = `RETURN 1`
        const result = await securedFetch(`api/graph/${graphName}/?query=${prepareArg(q)}`, {
            method: "GET"
        })

        if (result.ok) {
            Toast(`Graph ${graphName} created successfully!`, "Success")
            onSetGraphName(graphName)
            setCreateOpen(false)
            setGraphName("")
        }

    }

    return (
        <div className="flex flex-col">
            <div className="h-2 rounded-t-lg Top" />
            <div className="py-4 px-11 flex justify-between items-center Header">
                <div className="flex gap-4 items-center">
                    <Image width={103} height={29} src="/ColorLogo.svg" alt="" />
                    <p className="text-neutral-200" >|</p>
                    <div className="flex gap-6">
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
                <div className="flex items-center gap-12">
                    {
                        !inCreate &&
                        <>
                            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        className="text-white"
                                        variant="Primary"
                                        label="New Graph"
                                        icon={<PlusCircle />}
                                    />
                                </DialogTrigger>
                                <DialogComponent className="w-[40%]" title="Add Graph" description="Enter new graph name">
                                    <form className="flex flex-col gap-12" onSubmit={handelCreateGraph}>
                                        <div className="flex flex-col gap-2">
                                            <p>Name:</p>
                                            <Input
                                                ref={ref => ref?.focus()}
                                                variant="Default"
                                                value={graphName}
                                                onChange={(e) => setGraphName(e.target.value)}
                                            />
                                        </div>
                                        <Button
                                            variant="Large"
                                            label="Create"
                                            type="submit"
                                        />
                                    </form>
                                </DialogComponent>
                            </Dialog>
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
                            {
                                !inSettings &&
                                <DropdownMenu onOpenChange={setHelpOpen}>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            className="flex gap-1 items-center focus-visible:outline-none"
                                            label="help"
                                            icon={<LifeBuoy size={20} />}
                                            open={helpOpen}
                                        />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem>
                                            <a
                                                className="w-full"
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
                                                className="w-full"
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
