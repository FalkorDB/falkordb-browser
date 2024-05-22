"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

/* eslint-disable react/require-default-props */
interface ComboboxProps {
  options: string[],
  selectedValue: string,
  setSelectedValue: (value: string) => void
}

export default function Combobox({ options, selectedValue, setSelectedValue }: ComboboxProps) {

  const [open, setOpen] = useState<boolean>(false)

  return (
    <DropdownMenu onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex flex-row items-center gap-2 focus-visible:outline-none"
          title="Select Graph"
          type="button"
        >
          <p className="text-2xl">{selectedValue || "Select Graph..."}</p>
          {
            open ?
              <ChevronUp size={40} strokeWidth={0.5} />
              : <ChevronDown size={40} strokeWidth={0.5} />
          }
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-52 bg-white">
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}