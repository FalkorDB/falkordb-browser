/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/require-default-props */

"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn, prepareArg, Row, securedFetch } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useSession } from "next-auth/react"
import Button from "./Button"
import TableComponent from "../TableComponent"
import CloseDialog from "../CloseDialog"
import ExportGraph from "../ExportGraph"
import DeleteGraph from "../graph/DeleteGraph"

interface ComboboxProps {
  options: string[],
  selectedValue: string,
  setSelectedValue: (value: string) => void,
  type?: "Graph" | "Schema",
  isSelectGraph?: boolean,
  disabled?: boolean,
  inTable?: boolean,
  label?: string,
  setOptions?: (value: string[]) => void,
  defaultOpen?: boolean,
  onOpenChange?: (open: boolean) => void
}

export default function Combobox({ isSelectGraph = false, disabled = false, inTable, type, label, options, setOptions, selectedValue, setSelectedValue, defaultOpen = false, onOpenChange }: ComboboxProps) {

  const [openMenage, setOpenMenage] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(defaultOpen)
  const [rows, setRows] = useState<Row[]>([])
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

  return (
    <Dialog open={openMenage} onOpenChange={setOpenMenage}>
      <Select value={selectedValue} onValueChange={setSelectedValue} open={open} onOpenChange={(o) => {
        setOpen(o)
        if (onOpenChange) onOpenChange(o)
      }}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SelectTrigger data-type="select" disabled={disabled || options.length === 0} className={cn("w-fit gap-2 border-none p-2", inTable ? "text-sm font-light" : "text-xl font-medium")}>
              <SelectValue placeholder={`Select ${label || type || "Graph"}`} />
            </SelectTrigger>
          </TooltipTrigger>
          <TooltipContent>
            {options.length === 0 ? "There is no graphs" : selectedValue || `Select ${label || type || "Graph"}`}
          </TooltipContent>
        </Tooltip>
        <SelectContent className="min-w-52 max-h-[30lvh] bg-foreground">
          <SelectGroup>
            <ul className="shrink grow overflow-auto">
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
            <DeleteGraph
              type={type!}
              options={options}
              rows={rows}
              handleSetRows={handleSetRows}
              setOpenMenage={setOpenMenage}
              setOptions={setOptions!}
              selectedValue={selectedValue}
              setSelectedValue={setSelectedValue}
              trigger={<Button
                variant="Primary"
                disabled={rows.filter(opt => opt.checked).length === 0}
                label="Delete"
              />}
            />
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