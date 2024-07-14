"use client"

import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Toast, cn, prepareArg, securedFetch } from "@/lib/utils"
import { Trash2, UploadIcon } from "lucide-react"
import { Dispatch, SetStateAction, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Upload from "../graph/UploadGraph"
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
}

export default function Combobox({ isSelectGraph, disabled = false, inTable, type, options, setOptions, selectedValue = "", setSelectedValue }: ComboboxProps) {

  const [open, setOpen] = useState<boolean>(false)
  const [optionName, setOptionName] = useState<string>("")
  const [editable, setEditable] = useState<string>("")
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)
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
    <Dialog>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={disabled}
            className={cn(inTable ? "text-sm font-light" : "text-2xl")}
            label={selectedValue || `Select ${type || "Graph"}...`}
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
                  className="w-full"
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
                    className="w-full"
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
                  ["GRAPH NAME", "EXPORT"].map((header) => (
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
                            <Button
                              variant="button"
                              className="disabled:text-gray-400 disabled:text-opacity-70"
                              icon={<UploadIcon />}
                              onClick={() => setIsUploadOpen(true)}
                            />
                          </DropdownMenuItem>
                          <DropdownMenuItem className="justify-center">
                            <Button
                              variant="button"
                              className="disabled:text-gray-400 disabled:text-opacity-70"
                              icon={<Trash2 />}
                              onClick={() => setIsDeleteOpen(true)}
                            />
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Upload isOpen={isUploadOpen} onOpen={setIsUploadOpen} />
                      <DeleteGraph
                        graphName={option}
                        isOpen={isDeleteOpen}
                        onOpen={setIsDeleteOpen}
                        onDeleteGraph={() => {
                          if (!setOptions) return
                          setOptions(prev => prev.filter(name => name !== option))
                          if (selectedValue !== option) return
                          setSelectedValue("")
                        }}
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