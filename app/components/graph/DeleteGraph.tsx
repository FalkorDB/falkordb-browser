import { useToast } from "@/components/ui/use-toast";
import { prepareArg, securedFetch, Row } from "@/lib/utils";
import React, { ReactNode, useContext, useState } from "react";
import DialogComponent from "../DialogComponent";
import Button from "../ui/Button";
import CloseDialog from "../CloseDialog";
import { IndicatorContext } from "../provider";

export default function DeleteGraph({ type, trigger, options, rows, handleSetRows, setOpenMenage, setOptions, selectedValue, setSelectedValue }: {
  type: "Schema" | "Graph"
  trigger: ReactNode
  options: string[]
  rows: Row[]
  handleSetRows: (rows: string[]) => void
  setOpenMenage: (openMenage: boolean) => void
  setOptions: (options: string[]) => void
  selectedValue: string
  setSelectedValue: (selectedValue: string) => void
}) {

  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const { indicator, setIndicator } = useContext(IndicatorContext)

  const handleDelete = async (opts: string[]) => {
    setIsLoading(true)
    try {
      const names = opts.map(opt => type === "Schema" ? `${opt}_schema` : opt)

      const newNames = await Promise.all(names.map(async (name) => {
        const result = await securedFetch(`api/graph/${prepareArg(name)}`, {
          method: "DELETE"
        }, toast, setIndicator)

        if (result.ok) return name

        return ""

      })).then(newGraphNames => options.filter(opt => !newGraphNames.filter(name => name !== "").includes(opt)))

      setOptions!(newNames)

      if (opts.includes(selectedValue) && setSelectedValue) setSelectedValue(newNames.length > 0 ? newNames[newNames.length - 1] : "")

      setOpen(false)
      setOpenMenage(false)
      handleSetRows(options.filter(opt => !opts.includes(opt)))
      toast({
        title: "Graph(s) deleted successfully",
        description: `The graph(s) ${opts.join(", ")} have been deleted successfully`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DialogComponent
      className="max-w-[90dvw]"
      open={open}
      onOpenChange={setOpen}
      title="Delete Graph"
      trigger={trigger}
      description={`Are you sure you want to delete the selected graph(s)? (${rows.filter(opt => opt.checked).map(opt => opt.cells[0].value as string).join(", ")})`}
    >
      <div className="flex justify-end gap-2">
        <Button
          indicator={indicator}
          variant="Primary"
          label="Delete Graph"
          onClick={() => handleDelete(rows.filter(opt => opt.checked).map(opt => opt.cells[0].value as string))}
          isLoading={isLoading}
        />
        <CloseDialog label="Cancel" />
      </div>
    </DialogComponent>
  );
}