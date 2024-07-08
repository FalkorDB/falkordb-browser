"use client"

import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Toast, cn, prepareArg, securedFetch } from "@/lib/utils"
import { ChevronDown, Trash2, UploadIcon, ChevronUp } from "lucide-react"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import TableView from "./TableView"
import Upload from "./Upload"
import DeleteGraph from "./DeleteGraph"
import DialogComponent from "./DialogComponent"
import Button from "./Button"
import IconButton from "./IconButton"

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
    <Button
      key="export"
      label="Export"
      variant="button"
      onClick={() => onExport(option)}
      type="button"
    />,
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
            <IconButton
              variant="button"
              className="disabled:text-gray-400 disabled:text-opacity-70"
              icon={<UploadIcon />}
              onClick={() => setIsUploadOpen(true)}
            />
          </DropdownMenuItem>
          <DropdownMenuItem className="justify-center">
            <IconButton
              variant="button"
              className="disabled:text-gray-400 disabled:text-opacity-70"
              icon={<Trash2 />}
              onClick={() => setIsDeleteOpen(true)}
            />
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
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger disabled={disabled} className="w-fit" asChild>
          {/* <Button
            variant="button"
            disabled={disabled}
            className={cn(inTable ? "text-sm font-light" : "text-2xl", "w-fit flex flex-row items-center gap-4 disabled:text-gray-300")}
            label={selectedValue || `Select ${type || "Graph"}...`}
            open={open}
            type="button"
          /> */}
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
                <Button
                  variant="button"
                  className="w-full"
                  label={option}
                  type="button"
                  onClick={() => {
                    setSelectedValue(option)
                    setOpen(false)
                  }}
                />
              </DropdownMenuItem>
            ))
          }
          {
            isSelectGraph &&
            <>
              <DropdownMenuSeparator className="bg-gray-300" />
              <DropdownMenuItem>
                <DialogTrigger asChild>
                  <Button
                    className="w-full"
                    label="Manage Graphs"
                    variant="button"
                  />
                </DialogTrigger>
              </DropdownMenuItem>
            </>
          }
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogComponent
        title="Manage Graphs"
      >
        <TableView
          tableHeaders={["GRAPH NAME", "EXPORT", ""]}
          tableRows={tableRows}
          editableCells={[{
            index: 0,
            setState: setNewOptionName
          }]}
          onHoverCells={[]}
        />
      </DialogComponent>
    </Dialog >
  )
}