"use client"

import { useState, Dispatch, createRef } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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
import { Label } from "@radix-ui/react-label"


/* eslint-disable react/require-default-props */
interface ComboboxProps {
  className?: string,
  type?: string,
  options: string[],
  addOption?: (value: string, file?: File) => void,
  selectedValue: string,
  setSelectedValue: Dispatch<string>
}

export default function Combobox({
  className = '',
  type = undefined,
  options,
  addOption = undefined,
  selectedValue, setSelectedValue
}: ComboboxProps) {

  const [open, setOpen] = useState(false)
  const inputRef = createRef<HTMLInputElement>()
  const inputFile = createRef<HTMLInputElement>()

  // read the text in the create input box and add it to the list of options
  const onAddOption = () => {
    setOpen(false)
    if (!inputRef.current?.value) {
      return
    }

    const file = inputFile.current?.files?.length ? inputFile.current?.files[0] : undefined;

    if (addOption) {
      addOption(inputRef.current.value, file)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      onAddOption();
    }
  }

  const entityType = type ?? ""
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] justify-between", className)}
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
                key={option}
                onSelect={(currentValue) => {
                  if (currentValue !== selectedValue) {
                    setSelectedValue(option)
                  }
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedValue === option ? "opacity-100" : "opacity-0"
                  )}
                />
                {option}
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
                    <DialogDescription className="flex flex-col space-y-4">
                      <Input type="text" ref={inputRef} id="create" name="create" onKeyDown={handleKeyDown} placeholder={`${entityType} name ...`} />
                      <div className="flex flex-row space-x-2 items-center">
                        <Label className="w-1/3" htmlFor="file">Import {entityType} data:</Label>
                        <Input className="w-2/3" ref={inputFile} type="file" id="file" name="file" accept=".rdb" />
                      </div>
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
  )
}