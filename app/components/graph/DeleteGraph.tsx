import { useToast } from "@/components/ui/use-toast";
import { prepareArg, securedFetch, Row } from "@/lib/utils";
import React, { useContext, useState } from "react";
import DialogComponent from "../DialogComponent";
import Button from "../ui/Button";
import CloseDialog from "../CloseDialog";
import { GraphNamesContext, IndicatorContext } from "../provider";

interface Props {
  type: "Schema" | "Graph"
  rows: Row[]
  handleSetRows: (rows: string[]) => void
  setOpenMenage: (openMenage: boolean) => void
  selectedValue: string
  setSelectedValue: (selectedValue: string) => void
}

export default function DeleteGraph({
  type,
  rows,
  handleSetRows,
  setOpenMenage,
  selectedValue,
  setSelectedValue
}: Props) {

  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const { indicator, setIndicator } = useContext(IndicatorContext)
  const { graphNames, setGraphNames } = useContext(GraphNamesContext)

  const handleDelete = async (deleteGraphNames: string[]) => {
    setIsLoading(true)
    try {
      const [failedDeletedGraphs, successDeletedGraphs] = await Promise.all(deleteGraphNames
        .map(async (name) => {
          const result = await securedFetch(`api/${type === "Schema" ? "schema" : "graph"}/${prepareArg(name)}`, {
            method: "DELETE"
          }, toast, setIndicator)

          if (result.ok) return ""

          return name

        })).then(newGraphNames => [newGraphNames.filter(n => n !== ""), deleteGraphNames.filter(n => !newGraphNames.includes(n))])

      const newGraphNames = graphNames.filter(n => !failedDeletedGraphs.includes(n))
      
      setGraphNames(newGraphNames)

      if (successDeletedGraphs.includes(selectedValue) && setSelectedValue) setSelectedValue(successDeletedGraphs.length > 0 ? newGraphNames[successDeletedGraphs.length - 1] : "")

      setOpen(false)
      setOpenMenage(false)
      handleSetRows(successDeletedGraphs)
      toast({
        title: "Graph(s) deleted successfully",
        description: successDeletedGraphs.length > 0 && `The graph(s) ${successDeletedGraphs.join(", ")} have been deleted successfully${failedDeletedGraphs.length > 0 && `The graph(s) ${failedDeletedGraphs.join(", ")} have not been deleted`}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DialogComponent
      className="max-w-[70dvw]"
      open={open}
      onOpenChange={setOpen}
      title="Delete Graph"
      trigger={
        <Button
          data-testid="deleteGraph"
          variant="Delete"
          disabled={rows.filter(opt => opt.checked).length === 0}
          label="Delete"
          title="Confirm the deletion of the selected graph(s)"
        />
      }
      description={`Are you sure you want to delete the selected graph(s)? (${rows.filter(opt => opt.checked).map(opt => opt.cells[0].value as string).join(", ")})`}
    >
      <div className="flex justify-end gap-2">
        <Button
          data-testid="deleteGraphConfirm"
          indicator={indicator}
          variant="Delete"
          label="Delete Graph"
          onClick={() => handleDelete(rows.filter(opt => opt.checked).map(opt => opt.cells[0].value as string))}
          isLoading={isLoading}
        />
        <CloseDialog
          data-testid="deleteGraphCancel"
          label="Cancel"
        />
      </div>
    </DialogComponent>
  );
}