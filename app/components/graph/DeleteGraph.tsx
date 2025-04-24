import { useToast } from "@/components/ui/use-toast";
import { prepareArg, securedFetch, Row } from "@/lib/utils";
import React, { ReactNode, useContext, useState } from "react";
import DialogComponent from "../DialogComponent";
import Button from "../ui/Button";
import CloseDialog from "../CloseDialog";
import { GraphNamesContext, IndicatorContext } from "../provider";

export default function DeleteGraph({ type, trigger, rows, handleSetRows, setOpenMenage, selectedValue, setSelectedValue }: {
  type: "Schema" | "Graph"
  trigger: ReactNode
  rows: Row[]
  handleSetRows: (rows: string[]) => void
  setOpenMenage: (openMenage: boolean) => void
  selectedValue: string
  setSelectedValue: (selectedValue: string) => void
}) {

  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const { indicator, setIndicator } = useContext(IndicatorContext)
  const { graphNames, setGraphNames } = useContext(GraphNamesContext)

  const handleDelete = async (deleteGraphNames: string[]) => {
    setIsLoading(true)
    try {
      const newNames = await Promise.all(deleteGraphNames
        .map(names => type === "Schema" ? `${names}_schema` : names)
        .map(async (name) => {
          const result = await securedFetch(`api/graph/${prepareArg(name)}`, {
            method: "DELETE"
          }, toast, setIndicator)

          if (result.ok) return name

          return ""

        })).then(newGraphNames => graphNames.filter(names => !newGraphNames.filter(name => name !== "").includes(names)))

      setGraphNames(newNames)

      if (deleteGraphNames.includes(selectedValue) && setSelectedValue) setSelectedValue(newNames.length > 0 ? newNames[newNames.length - 1] : "")

      setOpen(false)
      setOpenMenage(false)
      handleSetRows(graphNames.filter(name => !deleteGraphNames.includes(name)))
      toast({
        title: "Graph(s) deleted successfully",
        description: `The graph(s) ${deleteGraphNames.join(", ")} have been deleted successfully`,
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