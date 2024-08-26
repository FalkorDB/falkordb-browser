"use client"

import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Toast, cn, prepareArg, securedFetch } from "@/lib/utils"
import { Trash2, UploadIcon } from "lucide-react"
import { Dispatch, SetStateAction, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import UploadGraph from "../graph/UploadGraph"
import DeleteGraph from "../graph/DeleteGraph"
import Button from "./Button"
import DialogComponent from "../DialogComponent"
import Input from "./Input"

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
  isSchema?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function Combobox({ isSelectGraph, disabled = false, inTable, type, options, setOptions, selectedValue = "", setSelectedValue, isSchema = false, defaultOpen = false, onOpenChange }: ComboboxProps) {

  const [openDialog, setOpenDialog] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(defaultOpen)
  const [optionName, setOptionName] = useState<string>("")
  const [editable, setEditable] = useState<string>("")
  const [isUploadOpen, setIsUploadOpen] = useState<string>()
  const [isDeleteOpen, setIsDeleteOpen] = useState<string>()
  const onExport = async (graphName: string) => {
    const result = await securedFetch(`api/graph/${prepareArg(graphName)}/export`, {
      method: "GET"
    })

    if (!result.ok) return

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

  const handelDelete = (option: string) => {
    if (!setOptions) return
    setOptions(prev => prev.filter(name => name !== option))
    if (selectedValue !== option) return
    setSelectedValue("")
    setOpenDialog(false)
  }

  const handelSetOption = async (e: React.KeyboardEvent<HTMLInputElement>, option: string) => {
    if (!setOptions) return
    if (e.key !== "Enter") return

    const result = await securedFetch(`api/graph/${prepareArg(optionName)}/?sourceName=${option}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: optionName })
    })

    if (!result.ok) {
      const json = await result.json()
      Toast(json.message)
      return
    }

    const newOptions = options.map((opt) => opt === option ? optionName : opt)
    setOptions(newOptions)
    setSelectedValue(optionName)
    setEditable("")
  }

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DropdownMenu open={open} onOpenChange={(o) => {
        setOpen(o)
        if (onOpenChange) onOpenChange(o)
      }}>
        <DropdownMenuTrigger disabled={disabled} asChild>
          <Button
            className={cn(inTable ? "text-sm font-light" : "text-2xl")}
            label={selectedValue || `Select ${type || "Graph"}`}
            open={open}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" className="min-w-52">
          {
            options.length > 0 &&
            options.map((option, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <DropdownMenuItem key={index}>
                <Button
                  className="w-full p-2"
                  label={option}
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
                    className="w-full p-2"
                    label="Manage Graphs"
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
        <div className="h-full w-full border border-[#57577B] rounded-lg overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-none">
                {
                  ["GRAPH NAME", "EXPORT", ""].map((header) => (
                    <TableHead key={header}>{header}</TableHead>
                  ))
                }
              </TableRow>
            </TableHeader>
            <TableBody>
              {
                options.length > 0 &&
                options.map((option, index) => (
                  <TableRow key={option} className={cn("border-none", !(index % 2) && "bg-[#57577B] hover:bg-[#57577B]")}>
                    <TableCell onClick={() => {
                      setEditable(option)
                      setOptionName(option)
                    }}>
                      {
                        option === editable ?
                          <Input
                            className="w-20"
                            variant="Small"
                            ref={ref => ref?.focus()}
                            value={optionName}
                            onChange={(e) => setOptionName(e.target.value)}
                            onBlur={() => setEditable("")}
                            onKeyDown={(e) => handelSetOption(e, option)}
                          />
                          : option
                      }
                    </TableCell>
                    <TableCell className="py-8">
                      <Button
                        key="export"
                        label="Export"
                        onClick={() => onExport(option)}
                      />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="rotate-90"
                            label="..."
                          />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" className="flex min-w-0">
                          <DropdownMenuItem className="p-2">
                            <Button
                              disabled
                              variant="button"
                              icon={<UploadIcon />}
                              onClick={() => setIsUploadOpen(option)}
                            />
                          </DropdownMenuItem>
                          <DropdownMenuItem className="p-2">
                            <Button
                              variant="button"
                              icon={<Trash2 />}
                              onClick={() => setIsDeleteOpen(option)}
                            />
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <UploadGraph open={isUploadOpen === option} onOpenChange={(o) => setIsUploadOpen(o ? option : "")} />
                      <DeleteGraph
                        graphName={option}
                        isOpen={isDeleteOpen === option}
                        onOpen={(o) => setIsDeleteOpen(o ? option : "")}
                        onDeleteGraph={handelDelete}
                        isSchema={isSchema}
                      />
                    </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </div>
      </DialogComponent>
    </Dialog >
  )
}