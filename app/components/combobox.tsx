"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn, securedFetch } from "@/lib/utils"
import { ChevronDown, ChevronUp, Download, Trash2, UploadIcon } from "lucide-react"
import { Dispatch, KeyboardEvent, SetStateAction, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import DeleteGraph from "./DeleteGraph"
import Upload from "./Upload"

/* eslint-disable react/require-default-props */
interface ComboboxProps {
  isSelectGraph?: boolean,
  disabled?: boolean,
  inTable?: boolean,
  type?: string | undefined,
  options: string[],
  setOptions?: Dispatch<SetStateAction<string[]>>,
  selectedValue?: string,
  setSelectedValue: (value: string) => void,
}

export default function Combobox({ isSelectGraph, disabled = false, inTable, type, options, setOptions, selectedValue = "", setSelectedValue }: ComboboxProps) {

  const [open, setOpen] = useState<boolean>(false)
  const [editable, setEditable] = useState<string>("")
  const [editName, setEditName] = useState<string>("")
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)
  const { toast } = useToast()

  const prepareArg = (arg: string) => encodeURIComponent(arg.trim())

  const onExport = async () => {
    const result = await securedFetch(`api/graph/${prepareArg(selectedValue)}/export`, {
      method: "GET"
    })

    if (!result.ok) {
      const json = await result.json()
      toast({
        title: "Error",
        description: json.message || "Something went wrong"
      })
      return
    }

    const blob = await result.blob()
    const url = window.URL.createObjectURL(blob)
    try {
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${selectedValue}.dump`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (e) {
      toast({
        title: "Error",
        description: (e as Error).message || "Something went wrong"
      })
    }
  }

  const onEdit = async (e: KeyboardEvent<HTMLTableCellElement>, option: string) => {
    if (!setOptions) return
    if (e.key === "Escape") {
      e.preventDefault()
      setEditable("")
      return
    }

    if (e.key !== "Enter") return
    e.preventDefault()

    const result = await securedFetch(`/api/graph/${prepareArg(editName)}/?sourceName=${prepareArg(option)}`, {
      method: "PATCH",
    })

    if (!result.ok) {
      toast({
        title: "Error",
        description: "Failed to edit graph",
      })
      return
    }
    setEditable("")
    setOptions(prev => prev.map(opt => {
      if (opt !== option) return opt
      return editName
    }))
    if (option !== selectedValue) return
    setSelectedValue(editName)
  }

  return (
    <Dialog>
      <DropdownMenu onOpenChange={setOpen}>
        <DropdownMenuTrigger disabled={disabled} className="w-fit" asChild>
          <button
            disabled={disabled}
            className={cn(inTable ? "text-sm font-light" : "text-2xl", "w-fit flex flex-row items-center gap-4 disabled:text-gray-300")}
            title="Select Graph"
            type="button"
          >
            <p>{selectedValue || `Select ${type || "Graph"}...`}</p>
            {
              open ?
                <ChevronUp size={inTable ? 20 : 15} />
                : <ChevronDown size={inTable ? 20 : 15} />
            }
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-52">
          {
            options.length > 0 &&
            options.map((option, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <DropdownMenuItem className="justify-center" asChild key={index}>
                <button
                  className="w-full"
                  title={option}
                  type="button"
                  onClick={() => setSelectedValue(option)}
                >
                  {option}
                </button>
              </DropdownMenuItem>
            ))
          }
          {
            isSelectGraph &&
            <>
              <DropdownMenuSeparator className="bg-gray-300" />
              <DropdownMenuItem>
                <DialogTrigger asChild>
                  <button
                    className="w-full"
                    title="Manage"
                    type="button"
                  >
                    <p>Manage...</p>
                  </button>
                </DialogTrigger>
              </DropdownMenuItem>
            </>
          }
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Graphs</DialogTitle>
        </DialogHeader>
        <div className="border border-gray-200 rounded-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium text-gray-400">GRAPH NAME</TableHead>
                <TableHead className="font-medium text-gray-400">EXPORT</TableHead>
                <TableHead className="w-[5%]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {
                options.length > 0 ?
                  options.map((option: string, index: number) => (
                    <TableRow
                      className={cn(!(index % 2) && "bg-gray-50 hover:bg-gray-50")}
                      // eslint-disable-next-line react/no-array-index-key
                      key={index}
                    // onMouseEnter={() => setIsHover(index)}
                    // onMouseLeave={() => setIsHover(null)}
                    >
                      <TableCell
                        ref={(ref) => {
                          if (!ref?.isContentEditable) return
                          ref.focus()
                        }}
                        className={cn("flex font-light text-gray-500 h-full", editable === option && "border border-gray-200")}
                        onClick={() => setEditable(option)}
                        contentEditable={editable === option}
                        onBlur={() => setEditable("")}
                        onKeyDown={(e) => onEdit(e, option)}
                        onInput={(e) => setEditName(e.currentTarget.textContent || "")}
                      >{option}</TableCell>
                      <TableCell className="font-light text-gray-500">
                        <button
                          title="Export"
                          type="button"
                          aria-label="Export"
                          onClick={onExport}
                        >
                          <p><Download /></p>
                        </button>
                      </TableCell>
                      <TableCell className="font-light text-gray-500">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="font-bold rotate-90"
                              title="More"
                              type="button"
                            >
                              <p>...</p>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="right" className="flex flex-row min-w-fit">
                            <DropdownMenuItem className="justify-center">
                              <button
                                className="disabled:text-gray-400 disabled:text-opacity-70"
                                title="Upload Data"
                                type="button"
                                aria-label="Upload Data"
                                onClick={() => setIsUploadOpen(true)}
                              >
                                <p><UploadIcon /></p>
                              </button>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="justify-center">
                              <button
                                className="disabled:text-gray-400 disabled:text-opacity-70"
                                title="Delete"
                                type="button"
                                aria-label="Delete"
                                onClick={() => setIsDeleteOpen(true)}
                              >
                                <p><Trash2 /></p>
                              </button>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Upload isOpen={isUploadOpen} onOpen={setIsUploadOpen} />
                        <DeleteGraph graphName={option} isOpen={isDeleteOpen} onOpen={setIsDeleteOpen} />
                      </TableCell>
                    </TableRow>
                  ))
                  : <TableRow>
                    <TableCell />
                  </TableRow>
              }
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}