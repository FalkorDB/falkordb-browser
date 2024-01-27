"use client"

import { useState, Dispatch, SetStateAction, createRef } from "react"
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

export function Combobox( props: {
  className?:string,
  type?: string,
  options: string[],
  addOption?: Dispatch<SetStateAction<string[]>>,
  selectedValue: string,
  setSelectedValue: Dispatch<SetStateAction<string>>
}) {
  const [open, setOpen] = useState(false)
  const inputRef = createRef<HTMLInputElement>()

  // read the text in the create input box and add it to the list of options
  function onAddOption(event: any) {
    setOpen(false)
    if (!inputRef.current?.value) {
      return
    }
    props.options.push(inputRef.current.value)
    if (props.addOption) {
      props.addOption(props.options)
    }
  }

  function handleKeyDown(event: any) {
    if (event.key === "Enter") {
      onAddOption(event);
    }
  }

  const entityType = props.type ?? ""
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-[200px] justify-between ${props.className} `}
        >
          {props.selectedValue
            ? props.options.find((option) => option === props.selectedValue)
            : `Select ${entityType}...`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup>
            {props.options.map((option) => (
              <CommandItem
                key={option}
                onSelect={(currentValue) => {
                  if (currentValue != props.selectedValue) {
                    props.setSelectedValue(currentValue)
                  }
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    props.selectedValue === option ? "opacity-100" : "opacity-0"
                  )}
                />
                {option}
              </CommandItem>
            ))}
            <Separator orientation="horizontal" />

            { props.addOption &&
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
                  <Button className="bg-blue-600 p-4 text-slate-50" type="submit" onClick={onAddOption}>Create</Button>
                </DialogContent>
              </Dialog>
            }
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
