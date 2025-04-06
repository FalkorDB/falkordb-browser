/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/require-default-props */

"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn, prepareArg, Row, securedFetch } from "@/lib/utils"
import { useContext, useEffect, useState } from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useSession } from "next-auth/react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import Button from "./Button"
import TableComponent from "../TableComponent"
import CloseDialog from "../CloseDialog"
import ExportGraph from "../ExportGraph"
import DeleteGraph from "../graph/DeleteGraph"
import Input from "./Input"
import { IndicatorContext } from "../provider"

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

const STEP = 4

export default function Combobox({ isSelectGraph = false, disabled = false, inTable, type = "Graph", label = type, options, setOptions, selectedValue, setSelectedValue, defaultOpen = false, onOpenChange }: ComboboxProps) {

  const [openMenage, setOpenMenage] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(defaultOpen)
  const [rows, setRows] = useState<Row[]>([])
  const [search, setSearch] = useState<string>("")
  const [filteredOptions, setFilteredOptions] = useState<string[]>([])
  const [maxOptions, setMaxOptions] = useState<number>(STEP)
  const { toast } = useToast()
  const { data: session } = useSession()
  const { indicator, setIndicator } = useContext(IndicatorContext)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilteredOptions(!search ? options : options.filter((option) => option.toLowerCase().includes(search.toLowerCase())))
    }, 500)

    return () => clearTimeout(timeout)
  }, [options, search])

  const handleSetOption = async (option: string, optionName: string) => {
    const result = await securedFetch(`api/graph/${prepareArg(option)}/?sourceName=${prepareArg(optionName)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: optionName })
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
    setRows(opts.map(opt => ({ checked: false, name: opt, cells: [{ value: opt, onChange: (value: string) => handleSetOption(value, opt) }] })))
  }

  useEffect(() => {
    handleSetRows(options)
  }, [options])

  return (
    <Dialog open={openMenage} onOpenChange={setOpenMenage}>
      <Select disabled={disabled || options.length === 0 || (indicator === "offline" && label === type)} value={selectedValue} onValueChange={setSelectedValue} open={open} onOpenChange={(o) => {
        setOpen(o)
        if (onOpenChange) onOpenChange(o)
      }}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SelectTrigger data-type="select" className={cn("w-fit gap-2 border-none p-2", inTable ? "text-sm font-light" : "text-xl font-medium")}>
              <SelectValue placeholder={`Select ${label}`} />
            </SelectTrigger>
          </TooltipTrigger>
          <TooltipContent>
            {indicator === "offline" && "The FalkorDB server is offline"}
            {indicator !== "offline" && (options.length === 0 ? "There is no graphs" : selectedValue || `Select ${label}`)}
          </TooltipContent>
        </Tooltip>
        <SelectContent className="min-w-52 max-h-[40lvh] bg-foreground">
          <div className="p-4" id="graphSearch">
            <Input ref={ref => ref?.focus()} className="w-full" placeholder={`Search for a ${label}`} onChange={(e) => {
              setSearch(e.target.value)
              setMaxOptions(5)
            }} value={search} />
          </div>
          <SelectGroup>
            <ul className="shrink grow overflow-auto" id="graphsList">
              {selectedValue && (
                <SelectItem value={selectedValue}>
                  {selectedValue}
                </SelectItem>
              )}
              {
                filteredOptions.slice(0, maxOptions).filter((option) => selectedValue !== option).map((option) => (
                  <SelectItem
                    value={!option ? '""' : option}
                    key={`key-${option}`}
                  >
                    {!option ? '""' : option}
                  </SelectItem>
                ))
              }
              <div className={cn("flex justify-center gap-2 pl-8 py-2", maxOptions <= 5 && "justify-start")}>
                {
                  filteredOptions.length > maxOptions && (
                    <Button onClick={() => setMaxOptions(maxOptions + STEP)}>
                      Show more...
                    </Button>
                  )
                }
                {
                  maxOptions !== 5 && maxOptions > STEP && ( // Excluded 5 because it's the initial after searching
                    <Button onClick={() => setMaxOptions(maxOptions - STEP)}>
                      Show fewer...
                    </Button>
                  )
                }
              </div>
              <p className="text-center text-sm">({maxOptions > filteredOptions.length ? filteredOptions.length : maxOptions}/{filteredOptions.length} results)</p>
            </ul>
          </SelectGroup>
          {
            isSelectGraph &&
            <>
              <SelectSeparator className="bg-secondary" />
              <DialogTrigger asChild>
                <Button
                  onClick={() => setOpen(false)}
                  className="w-full p-2 justify-center"
                  label="Manage Graphs"
                  title="Organize and edit your graphs"
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
        <VisuallyHidden>
          <DialogDescription />
        </VisuallyHidden>
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
                title="Confirm the deletion of the selected graph(s)"
              />}
            />
          }
          <ExportGraph
            trigger={
              <Button
                variant="Primary"
                label="Export Data"
                title="Export graph data to a .dump file"
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