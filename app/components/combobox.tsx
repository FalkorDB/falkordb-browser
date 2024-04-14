"use client"

import { useState, Dispatch, createRef } from "react"
import { Check, ChevronsUpDown, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter
} from "@/components/ui/alert-dialog"

/* eslint-disable react/require-default-props */
interface ComboboxProps {
  className?: string,
  type?: string,
  options: string[],
  addOption?: Dispatch<string> | null,
  deleteOption?: (graphName :string) => void,
  selectedValue: string,
  setSelectedValue: Dispatch<string>
}

export default function Combobox({ className = '', type = '', options, addOption = null, deleteOption, selectedValue, setSelectedValue }: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [deleteGraph, setDeleteGraph] = useState<string>("")
  const inputRef = createRef<HTMLInputElement>()

  // read the text in the create input box and add it to the list of options
  const onAddOption = () => {
    setOpen(false)
    if (!inputRef.current?.value) {
      return
    }
    if (addOption) {
      addOption(inputRef.current.value)
    }
  }

  const onDeleteOption = (graphName: string) => {
    setOpen(false)
    if (deleteOption) {
      deleteOption(graphName)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      onAddOption();
    }
  }

  const entityType = type ?? ""
  return (
    <AlertDialog>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`w-[200px] justify-between ${className} `}
          >
            {selectedValue
              ? options.find((option) => option === selectedValue)
              : `Select ${entityType}...`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search framework..." />
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  className="w-full flex flex-row justify-around"
                  key={option}
                  onSelect={(currentValue) => {
                    if (currentValue !== selectedValue) {
                      setSelectedValue(option)
                    }
                    setOpen(false)
                  }}
                >
                  <div className="flex flex-row">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValue === option ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option}
                  </div>
                  {
                    deleteOption &&
                    <AlertDialogTrigger onClick={() => setDeleteGraph(option)}>
                      <Trash2 />
                    </AlertDialogTrigger>
                  }
                </CommandItem>
              ))}
              <Separator orientation="horizontal" />
              {addOption &&
                <Dialog>
                  <DialogTrigger>
                    <CommandItem>Create new {entityType}...</CommandItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create a new {entityType}?</DialogTitle>
                      <DialogDescription>
                        <Input type="text" ref={inputRef} id="create" name="create" onKeyDown={handleKeyDown} placeholder={`${entityType} name ...`} />
                      </DialogDescription>
                    </DialogHeader>
                    <Button className="p-4" type="submit" onClick={onAddOption}>Create</Button>
                  </DialogContent>
                </Dialog>
              }
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure you?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you absolutely sure you want to delete {deleteGraph}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => onDeleteOption(deleteGraph)}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}