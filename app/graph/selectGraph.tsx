/* eslint-disable @typescript-eslint/no-use-before-define */

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { DialogHeader, DialogDescription, DialogTrigger, DialogTitle, DialogContent, Dialog } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { fetchOptions, prepareArg, Row, securedFetch } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { ChevronDown, ChevronUp, PlusCircle, Settings } from "lucide-react";
import Button from "../components/ui/Button";
import { IndicatorContext, BrowserSettingsContext } from "../components/provider";
import PaginationList from "../components/PaginationList";
import TableComponent from "../components/TableComponent";
import ExportGraph from "../components/ExportGraph";
import DeleteGraph from "../components/graph/DeleteGraph";
import CloseDialog from "../components/CloseDialog";
import DuplicateGraph from "../components/graph/DuplicateGraph";
import CreateGraph from "../components/CreateGraph";
import { Graph } from "../api/graph/model";

interface Props {
    options: string[],
    setOptions: (options: string[]) => void
    selectedValue: string
    setSelectedValue: (value: string) => void
    type: "Graph" | "Schema"
    setGraph: (graph: Graph) => void
}

export default function SelectGraph({ options, setOptions, selectedValue, setSelectedValue, type, setGraph }: Props) {

    const { indicator, setIndicator } = useContext(IndicatorContext)
    const {
        settings: {
            contentPersistenceSettings: {
                contentPersistence
            }
        },
        tutorialOpen
    } = useContext(BrowserSettingsContext)

    const inputRef = useRef<HTMLInputElement>(null)

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

    const getOptions = useCallback(async () =>
        fetchOptions(type, toast, setIndicator, indicator, setSelectedValue, setOptions, contentPersistence)
        , [type, toast, setIndicator, indicator, setSelectedValue, setOptions, contentPersistence])


    const handleSetOption = useCallback(async (option: string, optionName: string) => {
        const result = await securedFetch(
            `api/${type === "Graph" ? "graph" : "schema"}/${prepareArg(option)}?sourceName=${prepareArg(optionName)}`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" }
            },
            toast,
            setIndicator
        )

        if (result.ok) {
            const newOptions = options.map((opt) => (opt === optionName ? option : opt))
            setOptions!(newOptions)

            if (setSelectedValue && optionName === selectedValue) setSelectedValue(option)

            // Rebuild rows to reflect the updated option names
            setRows(
                newOptions.map(opt =>
                    session?.user?.role === "Admin"
                        ? ({
                            checked: false,
                            name: opt,
                            cells: [{ value: opt, onChange: (value: string) => handleSetOption(value, opt), type: "text" }]
                        })
                        : ({ checked: false, name: opt, cells: [{ value: opt, type: "readonly" }] })
                )
            )
        }

        return result.ok
    }, [type, toast, setIndicator, options, setOptions, setSelectedValue, selectedValue, setRows, session])

    // Build rows whenever options change

    useEffect(() => {
        setRows(
            options.map(opt =>
                session?.user?.role === "Admin"
                    ? ({
                        checked: false,
                        name: opt,
                        cells: [{ value: opt, onChange: (value: string) => handleSetOption(value, opt), type: "text" }]
                    })
                    : ({ checked: false, name: opt, cells: [{ value: opt, type: "readonly" }] })
            )
        )
    }, [options, session, handleSetOption])

    const handleOpenChange = async (o: boolean) => {
        setOpen(o)

        if (!o || tutorialOpen) return

        try {
            setIsLoading(true)
            await getOptions()
        } finally {
            setIsLoading(false)
        }
    }

    const handleClick = (value: string) => {
        setSelectedValue(value)
        setOpen(false)
    }

    const handleSetRows = useCallback((opts: string[]) => {
        setRows(
            opts.map(opt =>
                session?.user?.role === "Admin"
                    ? ({
                        checked: false,
                        name: opt,
                        cells: [{ value: opt, onChange: (value: string) => handleSetOption(value, opt), type: "text" }]
                    })
                    : ({ checked: false, name: opt, cells: [{ value: opt, type: "readonly" }] })
            )
        )
    }, [session, setRows, handleSetOption])

    return (
        <Dialog open={openMenage} onOpenChange={setOpenMenage}>
            <DropdownMenu open={open} onOpenChange={handleOpenChange}>
                <DropdownMenuTrigger disabled={options.length === 0 || indicator === "offline"} asChild>
                    <Button
                        className="h-full w-[230px] text-2xl bg-background rounded-lg border border-border p-2 justify-left disabled:text-gray-400 disabled:opacity-100 SofiaSans"
                        label={selectedValue || `Select ${type}`}
                        title={options.length === 0 ? `There are no ${type}` : undefined}
                        indicator={indicator}
                        data-testid={`select${type}`}
                    >
                        {
                            open ?
                                <ChevronUp className="min-w-4 min-h-4" />
                                :
                                <ChevronDown className="min-w-4 min-h-4" />
                        }
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="h-[40dvh] min-h-fit w-[350px] mt-2 overflow-hidden border border-border rounded-lg flex flex-col items-center p-4"
                    preventOutsideClose={tutorialOpen}
                >
                    <PaginationList
                        className="basis-0 grow min-h-fit p-0"
                        list={options}
                        onClick={handleClick}
                        dataTestId={`select${type}`}
                        label={type}
                        afterSearchCallback={() => { }}
                        isSelected={(value) => selectedValue === value}
                        isLoading={isLoading}
                        searchRef={inputRef}
                    />
                    <div className="flex gap-2">
                        <CreateGraph
                            type={type}
                            graphNames={options}
                            onSetGraphName={(newGraphName) => {
                                setSelectedValue(newGraphName);
                                setOptions([...options, newGraphName]);
                            }}
                            trigger={
                                <Button
                                    className="w-fit"
                                    variant="Primary"
                                    label="Create"
                                >
                                    <PlusCircle size={20} />
                                </Button>
                            }
                        />
                        <DialogTrigger asChild>
                            <Button
                                className="w-fit"
                                variant="Primary"
                                label="Manage"
                                data-testid={`manage${type}s`}
                            >
                                <Settings size={20} />
                            </Button>
                        </DialogTrigger>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
            <DialogContent
                data-testid="manageContent"
                onEscapeKeyDown={(e) => {
                    if (inputRef.current === document.activeElement) {
                        e.preventDefault()
                    }
                }}
                hideClose
                hideOverlay={tutorialOpen}
                preventOutsideClose={tutorialOpen}
                className="flex flex-col border-none rounded-lg max-w-none h-[90dvh]"
            >
                <DialogHeader className="flex-row justify-between items-center border-b border-border pb-4">
                    <DialogTitle className="text-2xl font-medium">Manage Graphs</DialogTitle>
                    <CloseDialog data-testid="closeManage" />
                </DialogHeader>
                <VisuallyHidden>
                    <DialogDescription />
                </VisuallyHidden>
                <TableComponent
                    className="grow overflow-hidden"
                    label={`${type}s`}
                    entityName={type}
                    headers={["Name"]}
                    rows={rows}
                    setRows={setRows}
                    inputRef={inputRef}
                >
                    {
                        session?.user?.role !== "Read-Only" &&
                        <>
                            <DeleteGraph
                                type={type}
                                rows={rows}
                                handleSetRows={handleSetRows}
                                selectedValue={selectedValue}
                                setGraphName={setSelectedValue}
                                setGraph={setGraph}
                                setOpenMenage={setOpenMenage}
                                graphNames={options}
                                setGraphNames={setOptions}
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