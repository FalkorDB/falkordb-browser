import { useToast } from "@/components/ui/use-toast";
import { getActiveConnectionIdGlobal, getConnectionEpoch, prepareArg, securedFetch, Row } from "@/lib/utils";
import React, { useContext, useEffect, useState } from "react";
import { Graph } from "@/app/api/graph/model";
import DialogComponent from "../DialogComponent";
import Button from "../ui/Button";
import CloseDialog from "../CloseDialog";
import { IndicatorContext } from "../provider";
import { buildDeleteGraphToast } from "./deleteGraph-utils";

interface Props {
  rows: Row[]
  setOpenMenage: (openMenage: boolean) => void
  selectedValue: string
  setGraphName: (graphName: string) => void
  setGraph: (graph: Graph) => void
  graphNames: string[]
  setGraphNames: (graphNames: string[]) => void
}

export default function DeleteGraph({
  rows,
  setOpenMenage,
  selectedValue,
  setGraphName,
  setGraph,
  graphNames,
  setGraphNames
}: Props) {

  const [open, setOpen] = useState(false);
  const [closeManage, setCloseManage] = useState(false);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { indicator, setIndicator } = useContext(IndicatorContext);

  useEffect(() => {
    if (!open && closeManage) {
      setOpenMenage(false);
      setCloseManage(false);
    }
  }, [open, closeManage, setOpenMenage]);

  useEffect(() => {
    if (!open) {
      setIsLoading(false);
    }
  }, [open]);

  const handleDelete = async (deleteGraphNames: string[]) => {
    const startEpoch = getConnectionEpoch();
    const cid = getActiveConnectionIdGlobal();
    setIsLoading(true);
    let newGraphNames;
    try {
      const [failedDeletedGraphs, successDeletedGraphs] = await Promise.all(deleteGraphNames
        .map(async (name) => {
          const result = await securedFetch(`api/graph/${prepareArg(name)}`, {
            method: "DELETE"
          }, toast, setIndicator, cid);

          if (result.ok) return "";

          return name;

        })).then(result => [result.filter(n => n !== ""), deleteGraphNames.filter(n => !result.includes(n))]);

      if (getConnectionEpoch() !== startEpoch) return;

      newGraphNames = graphNames.filter(n => !successDeletedGraphs.includes(n));

      setGraphNames(newGraphNames);

      if (successDeletedGraphs.includes(selectedValue)) {
        setGraphName(newGraphNames.length > 0 ? newGraphNames[newGraphNames.length - 1] : "");
        setGraph(Graph.empty());
      }

      // Rows update is handled automatically by useEffect([options, handleSetRows])
      // in selectGraph.tsx when graphNames changes — no manual call needed here.

      // Only show a success toast when at least one graph was actually deleted;
      // per-graph failures are already surfaced by securedFetch's destructive toasts.
      const deleteToast = buildDeleteGraphToast(successDeletedGraphs, failedDeletedGraphs);
      if (deleteToast) {
        toast(deleteToast);
      }
    } finally {
      setIsLoading(false);
      setOpen(false);
      if (typeof newGraphNames !== "undefined" && newGraphNames.length === 0) {
        setCloseManage(true);
      }
    }
  };

  return (
    <DialogComponent
      className="max-w-[70dvw]"
      open={open}
      onOpenChange={setOpen}
      title="Delete Graph"
      trigger={
        <Button
          className="p-1 text-xs"
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