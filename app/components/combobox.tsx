"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Toast, cn, prepareArg, securedFetch } from "@/lib/utils"
import { ChevronDown, ChevronUp, Trash2, UploadIcon } from "lucide-react"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import TableView from "./TableView"
import Upload from "./Upload"
import DeleteGraph from "./DeleteGraph"

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
  const [optionName, setNewOptionName] = useState<string[]>([])
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)
  const onExport = async (graphName: string) => {
    const result = await securedFetch(`api/graph/${prepareArg(graphName)}/export`, {
      method: "GET"
    })

    if (!result.ok) {
      const json = await result.json()
      Toast(json.message)
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
      Toast((e as Error).message)
    }
  }
  const tableRows = options.map(option => [
    option,
    <button
      key="export"
      onClick={() => onExport(option)}
      type="button"
    >Export</button>,
    <div key="menu">
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
    </div>
  ])

  useEffect(() => {
    if (!setOptions || optionName.length === 0) return
    const run = async () => {
      const result = await fetch(`api/graph/${prepareArg(optionName[1])}/?sourceName=${optionName[0]}`, {
        method: "PUT",
      })
      if (!result.ok) {
        const json = await result.json()
        Toast(json.message || "Failed to rename graph")
        return
      }
      setOptions(prev => prev.filter(option => option !== optionName[0]).concat(optionName[1]))
    }
    run()
  }, [optionName, setOptions])

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
      <DialogContent className="w-1/4">
        <DialogHeader>
          <DialogTitle>Manage Graphs</DialogTitle>
        </DialogHeader>
        <TableView
          tableHeaders={["GRAPH NAME", "EXPORT", ""]}
          tableRows={tableRows}
          editableCells={[{
            index: 0,
            setState: setNewOptionName
          }]}
          onHoverCells={[]} 
          />
      </DialogContent>
    </Dialog>
  )
}