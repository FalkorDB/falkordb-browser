/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/require-default-props */

"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn, prepareArg, securedFetch } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useSession } from "next-auth/react"
import Button from "./Button"
import TableComponent, { Row } from "../TableComponent"
import CloseDialog from "../CloseDialog"
import ExportGraph from "../ExportGraph"
import DialogComponent from "../DialogComponent"

interface ComboboxProps {
  isSelectGraph?: boolean,
  disabled?: boolean,
  inTable?: boolean,
  type?: string | undefined,
  options: string[],
  setOptions?: (value: string[]) => void,
  selectedValue?: string,
  setSelectedValue?: (value: string) => void,
  isSchema?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function Combobox({ isSelectGraph = false, disabled = false, inTable, type, options, setOptions, selectedValue = "", setSelectedValue, isSchema = false, defaultOpen = false, onOpenChange }: ComboboxProps) {

  const [openMenage, setOpenMenage] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(defaultOpen)
  const [rows, setRows] = useState<Row[]>([])
  const [openDelete, setOpenDelete] = useState<boolean>(false)
  const { toast } = useToast()
  const { data: session } = useSession()

  const handleSetOption = async (option: string, optionName: string) => {
    const result = await securedFetch(`api/graph/${prepareArg(option)}/?sourceName=${prepareArg(optionName)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: optionName })
    }, toast)

    if (result.ok) {

      const newOptions = options.map((opt) => opt === optionName ? option : opt)
      setOptions!(newOptions)

      if (setSelectedValue && optionName === selectedValue) setSelectedValue(option)

      handleSetRows(newOptions)
    }

    return result.ok
  }

  const handleSetRows = (opts: string[]) => {
    setRows(opts.map(opt => ({ checked: false, name: opt, cells: [{ value: opt, onChange: (value: string) => handleSetOption(value, opt) }] })))
  }

  useEffect(() => {
    handleSetRows(options)
  }, [options])

  const handleDelete = async (opts: string[]) => {
    const names = opts.map(opt => isSchema ? `${opt}_schema` : opt)

    const newNames = await Promise.all(names.map(async (name) => {
      const result = await securedFetch(`api/graph/${prepareArg(name)}`, {
        method: "DELETE"
      }, toast)

      if (result.ok) return name

      return ""

    })).then(graphNames => graphNames.filter(name => name !== "")).then(graphNames => options.filter(opt => !graphNames.includes(opt)))

    setOptions!(newNames)

    if (opts.includes(selectedValue) && setSelectedValue) setSelectedValue(newNames[newNames.length - 1])

    setOpenDelete(false)
    setOpenMenage(false)
    handleSetRows(newNames)

    const deletedNames = opts.filter(opt => !newNames.includes(opt))
    const notDeletedNames = opts.filter(opt => newNames.includes(opt))

    toast({
      title: "Graph(s) deleted successfully",
      description: `${deletedNames.length > 0 ? `The graph(s) ${deletedNames.join(", ")} have been deleted successfully` : ''}${deletedNames.length > 0 && notDeletedNames.length > 0 ? '. ' : ''}${notDeletedNames.length > 0 ? `The graph(s) ${notDeletedNames.join(", ")} could not be deleted` : ''}`,
    })
  }

  return (
    <Dialog open={openMenage} onOpenChange={setOpenMenage}>
      <Select value={selectedValue} onValueChange={setSelectedValue} open={open} onOpenChange={(o) => {
        setOpen(o)
        if (onOpenChange) onOpenChange(o)
      }}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SelectTrigger data-type="select" disabled={disabled || options.length === 0} className={cn("w-fit gap-2 border-none p-2", inTable ? "text-sm font-light" : "text-xl font-medium")}>
              <SelectValue placeholder={`Select ${type || "Graph"}`} />
            </SelectTrigger>
          </TooltipTrigger>
          <TooltipContent>
            {options.length === 0 ? "There is no graphs" : selectedValue || `Select ${type || "Graph"}`}
          </TooltipContent>
        </Tooltip>
        <SelectContent className="min-w-52 max-h-[30lvh] bg-foreground">
          <SelectGroup>
            <ul className="shrink grow overflow-auto" id="graphsList">
              {
                options.map((option) => (
                  <SelectItem
                    value={!option ? '""' : option}
                    key={`key-${option}`}
                  >
                    {!option ? '""' : option}
                  </SelectItem>
                ))
              }
            </ul>
          </SelectGroup>
          {
            isSelectGraph &&
            <>
              <SelectSeparator className="bg-secondary" />
              <DialogTrigger asChild>
                <Button
                  onClick={() => setOpen(false)}
                  className="w-full p-2"
                  label="Manage Graphs"
                />
              </DialogTrigger>
            </>
          }
        </SelectContent>
      </Select>
      <DialogContent disableClose className="flex flex-col border-none rounded-lg max-w-none max-h-[90dvh]">
        <DialogHeader className="flex-row justify-between items-center border-b border-secondary pb-4">
          <DialogTitle className="text-2xl font-medium">Manage Graphs</DialogTitle>
          <CloseDialog />
        </DialogHeader>
        <TableComponent
          className="grow overflow-hidden"
          headers={["Name"]}
          rows={rows}
          setRows={setRows}
        >
          {
            session?.user?.role !== "Read-Only" &&
            <DialogComponent
              className="max-w-[90dvw]"
              open={openDelete}
              onOpenChange={setOpenDelete}
              title="Delete Graph"
              trigger={<Button
                variant="Primary"
                disabled={rows.filter(opt => opt.checked).length === 0}
                label="Delete"
              />}
              description={`Are you sure you want to delete the selected graph(s)? (${rows.filter(opt => opt.checked).map(opt => opt.cells[0].value as string).join(", ")})`}
            >
              <div className="flex justify-end gap-2">
                <Button
                  variant="Primary"
                  label="Delete Graph"
                  onClick={() => handleDelete(rows.filter(opt => opt.checked).map(opt => opt.cells[0].value as string))}
                />
                <CloseDialog label="Cancel" />
              </div>
            </DialogComponent>
          }
          <ExportGraph
            trigger={
              <Button
                variant="Primary"
                label="Export Data"
                disabled={rows.filter(opt => opt.checked).length === 0}
              />
            }
            selectedValues={rows.filter(opt => opt.checked).map(opt => opt.cells[0].value as string)}
            type={type!}
          />
        </TableComponent>
      </DialogContent>
    </Dialog >
  )
}