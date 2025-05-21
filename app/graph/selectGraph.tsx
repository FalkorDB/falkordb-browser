/* eslint-disable @typescript-eslint/no-use-before-define */

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useContext, useEffect, useState } from "react";
import { DialogHeader, DialogDescription, DialogTrigger, DialogTitle, DialogContent, Dialog } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { prepareArg, Row, securedFetch } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { ChevronDown, ChevronUp } from "lucide-react";
import Button from "../components/ui/Button";
import { IndicatorContext } from "../components/provider";
import PaginationList from "../components/PaginationList";
import TableComponent from "../components/TableComponent";
import ExportGraph from "../components/ExportGraph";
import DeleteGraph from "../components/graph/DeleteGraph";
import CloseDialog from "../components/CloseDialog";
import DuplicateGraph from "../components/graph/DuplicateGraph";

interface Props {
    options: string[],
    setOptions: (options: string[]) => void
    selectedValue: string
    setSelectedValue: (value: string) => void
    type: "Graph" | "Schema"
    onOpenChange: (open: boolean) => Promise<void>
}

export default function SelectGraph({ options, setOptions, selectedValue, setSelectedValue, type, onOpenChange }: Props) {

    const { indicator, setIndicator } = useContext(IndicatorContext)

    const { toast } = useToast()
    const { data: session } = useSession()

    const [open, setOpen] = useState(false)
    const [rows, setRows] = useState<Row[]>([])
    const [openMenage, setOpenMenage] = useState(false)
    const [openDuplicate, setOpenDuplicate] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setOpen(false)
    }, [selectedValue])

    const handleSetOption = async (option: string, optionName: string) => {
        const result = await securedFetch(`api/${type === "Graph" ? "graph" : "schema"}/${prepareArg(option)}/?sourceName=${prepareArg(optionName)}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
        }, toast, setIndicator)

        if (result.ok) {

            const newOptions = options.map((opt) => opt === optionName ? option : opt)
            setOptions!(newOptions)

            if (setSelectedValue && optionName === selectedValue) setSelectedValue(option)

            handleSetRows(newOptions)
        }

        return result.ok
    }

    const handleSetRows = (opts: string[]) => {
        setRows(opts.map(opt => session?.user?.role === "Admin" ? ({ checked: false, name: opt, cells: [{ value: opt, onChange: (value: string) => handleSetOption(value, opt), type: "text" }] }) : ({ checked: false, name: opt, cells: [{ value: opt, type: "readonly" }] })))
    }

    useEffect(() => {
        handleSetRows(options)
    }, [options])

    const handleOpenChange = async (o: boolean) => {
        setOpen(o)
        setIsLoading(true)
        try {
            await onOpenChange(o)
        } finally {
            setIsLoading(false)
        }
    }

    const handleClick = (value: string) => {
        setSelectedValue(value)
        setOpen(false)
    }

    return (
        <Dialog open={openMenage} onOpenChange={setOpenMenage}>
            <DropdownMenu open={open} onOpenChange={handleOpenChange}>
                <DropdownMenuTrigger asChild>
                    <Button
                        className="w-[200px] bg-foreground rounded-lg border p-2 justify-center"
                        disabled={options.length === 0 || indicator === "offline"}
                        label={selectedValue || `Select ${type}`}
                        title={options.length === 0 ? `There are no ${type}` : undefined}
                        indicator={indicator}
                    >
                        {
                            open ?
                                <ChevronUp className="min-w-4 min-h-4" />
                                :
                                <ChevronDown className="min-w-4 min-h-4" />
                        }
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="h-[400px] w-[350px] mt-2 overflow-hidden border rounded-lg flex flex-col items-center p-8">
                    <PaginationList
                        className="h-1 grow p-0"
                        list={options}
                        step={3}
                        onClick={handleClick}
                        dataTestId="selectGraph"
                        label="graph"
                        afterSearchCallback={() => { }}
                        isSelected={(value) => selectedValue === value}
                        isLoading={isLoading}
                    />
                    <DialogTrigger asChild>
                        <Button
                            className="w-fit"
                            variant="Primary"
                            label={`Manage ${type}s`}
                        />
                    </DialogTrigger>
                </DropdownMenuContent>
            </DropdownMenu>
            <DialogContent disableClose className="flex flex-col border-none rounded-lg max-w-none max-h-[90dvh]">
                <DialogHeader className="flex-row justify-between items-center border-b border-secondary pb-4">
                    <DialogTitle className="text-2xl font-medium">Manage Graphs</DialogTitle>
                    <CloseDialog />
                </DialogHeader>
                <VisuallyHidden>
                    <DialogDescription />
                </VisuallyHidden>
                <TableComponent
                    className="grow overflow-hidden"
                    label={`${type}s`}
                    headers={["Name"]}
                    rows={rows}
                    setRows={setRows}
                >
                    {
                        session?.user?.role !== "Read-Only" &&
                        <>
                            <DeleteGraph
                                type={type}
                                rows={rows}
                                handleSetRows={handleSetRows}
                                setOpenMenage={setOpenMenage}
                                selectedValue={selectedValue}
                                setSelectedValue={setSelectedValue}
                            />
                            <ExportGraph
                                selectedValues={rows.filter(opt => opt.checked).map(opt => opt.cells[0].value as string)}
                                type={type}
                            />
                            <DuplicateGraph
                                selectedValue={rows.filter(opt => opt.checked).map(opt => opt.cells[0].value as string)[0]}
                                type={type}
                                open={openDuplicate}
                                onOpenChange={setOpenDuplicate}
                                onDuplicate={(duplicateName) => {
                                    setSelectedValue(duplicateName)
                                    setOptions!([...options, duplicateName])
                                }}
                                disabled={rows.filter(opt => opt.checked).length !== 1}
                            />
                        </>
                    }
                </TableComponent>
            </DialogContent>
        </Dialog>
    )
}