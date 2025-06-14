
"use client"

import { Dialog } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useContext, useEffect, useState } from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import Button from "./Button"
import Input from "./Input"
import { IndicatorContext } from "../provider"

interface ComboboxProps {
  options: string[],
  selectedValue: string,
  setSelectedValue: (value: string) => void,
  label: "Role" | "Type",
  disabled?: boolean,
  inTable?: boolean,
  defaultOpen?: boolean,
}

const STEP = 4

export default function Combobox({ disabled = false, inTable = false, label, options, selectedValue, setSelectedValue, defaultOpen = false }: ComboboxProps) {

  const { indicator } = useContext(IndicatorContext)

  const [filteredOptions, setFilteredOptions] = useState<string[]>([])
  const [openMenage, setOpenMenage] = useState<boolean>(false)
  const [maxOptions, setMaxOptions] = useState<number>(STEP)
  const [open, setOpen] = useState<boolean>(defaultOpen)
  const [search, setSearch] = useState<string>("")

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilteredOptions(!search ? options : options.filter((option) => option.toLowerCase().includes(search.toLowerCase())))
    }, 500)

    return () => clearTimeout(timeout)
  }, [options, search])

  return (
    <Dialog open={openMenage} onOpenChange={setOpenMenage}>
      <Select
        disabled={disabled || options.length === 0}
        value={selectedValue}
        onValueChange={setSelectedValue}
        open={open}
        onOpenChange={setOpen}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <SelectTrigger
              data-testid={`select${label}`}
              data-type="select"
              className={cn("w-fit gap-2 items-center border p-2 disabled:text-gray-400 disabled:opacity-100 disabled:cursor-not-allowed", inTable ? "text-sm font-light" : "text-xl font-medium")}
            >
              <SelectValue placeholder={`Select ${label}`} />
            </SelectTrigger>
          </TooltipTrigger>
          <TooltipContent>
            {indicator === "offline" && "The FalkorDB server is offline"}
            {indicator !== "offline" && (options.length === 0 ? `There are no ${label}s` : selectedValue || `Select ${label}`)}
          </TooltipContent>
        </Tooltip>
        <SelectContent className="min-w-52 max-h-[40dvh] bg-foreground">
          <div className="p-4 flex gap-2 items-center">
            <Input
              data-testid={`search${label}`}
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
                <SelectItem value={selectedValue}>
                  {selectedValue}
                </SelectItem>
              )}
              {
                filteredOptions.slice(0, maxOptions).filter((option) => selectedValue !== option).map((option) => (
                  <SelectItem
                    data-testid={`select${label}Item${option}`}
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
  disabled: false,
  inTable: false,
  defaultOpen: false,
}