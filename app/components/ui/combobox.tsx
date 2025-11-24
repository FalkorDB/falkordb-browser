
"use client"

import { Dialog } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useContext, useEffect, useState } from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from "@/components/ui/select"
import Button from "./Button"
import Input from "./Input"
import { IndicatorContext } from "../provider"

interface ComboboxProps<T extends string> {
  id?: string,
  options: T[],
  selectedValue: T,
  setSelectedValue: (value: T) => void,
  label: "Role" | "Type" | "Model" | "Theme",
  disabled?: boolean,
  inTable?: boolean,
  defaultOpen?: boolean,
  className?: string,
}

const STEP = 4

export default function Combobox<T extends string>({ id, disabled = false, inTable = false, label, options, selectedValue, setSelectedValue, defaultOpen = false, className }: ComboboxProps<T>) {

  const { indicator } = useContext(IndicatorContext)

  const [filteredOptions, setFilteredOptions] = useState<T[]>([])
  const [openMenage, setOpenMenage] = useState<boolean>(false)
  const [maxOptions, setMaxOptions] = useState<number>(STEP)
  const [open, setOpen] = useState<boolean>(defaultOpen)
  const [search, setSearch] = useState<string>("")

  useEffect(() => {
    if (!open) {
      setSearch("")
      setMaxOptions(STEP)
      setFilteredOptions([...options])
    }
  }, [open, options])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilteredOptions(!search ? options : options.filter((option) => option.toLowerCase().includes(search.toLowerCase())))
    }, 500)

    return () => clearTimeout(timeout)
  }, [options, search])

  const getTitle = () => {
    switch (true) {
      case indicator === "offline":
        return "The FalkorDB server is offline"
      case options.length === 0:
        return `There are no ${label}s`
      default:
        return selectedValue || `Select ${label}`
    }
  }

  return (
    <Dialog open={openMenage} onOpenChange={setOpenMenage}>
      <Select
        disabled={disabled || options.length === 0}
        value={selectedValue}
        onValueChange={setSelectedValue}
        open={open}
        onOpenChange={setOpen}
      >
        <SelectTrigger
          id={id}
          data-testid={`select${label}`}
          data-type="select"
          title={getTitle()}
          className={cn("w-fit gap-2 items-center border border-border p-2 disabled:text-gray-300 disabled:cursor-not-allowed", inTable ? "text-sm font-light" : "text-xl font-medium", className)}
        >
          <p className="truncate">{selectedValue || `Select ${label}`}</p>
        </SelectTrigger>
        <SelectContent className="min-w-52 max-h-[40dvh] bg-background">
          <div className="p-4 flex gap-2 items-center">
            <Input
              data-testid={`${label}Search`}
              ref={ref => ref?.focus()}
              className="w-1 grow"
              placeholder={`Search for a ${label}`}
              onChange={(e) => {
                setSearch(e.target.value)
                setMaxOptions(5)
              }}
              value={search}
            />
          </div>
          <SelectGroup>
            <ul className="shrink grow overflow-auto">
              {selectedValue && (
                <SelectItem
                  data-testid={`select${label}${selectedValue}`}
                  value={selectedValue}
                  key={`key-${selectedValue}`}
                >
                  {selectedValue}
                </SelectItem>
              )}
              {
                filteredOptions.slice(0, maxOptions).filter((option) => selectedValue !== option).map((option) => (
                  <SelectItem
                    data-testid={`select${label}${option}`}
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
        </SelectContent>
      </Select>
    </Dialog >
  )
}

Combobox.defaultProps = {
  id: undefined,
  disabled: false,
  inTable: false,
  defaultOpen: false,
  className: undefined,
}