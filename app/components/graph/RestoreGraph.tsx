import { FormEvent, useContext, useEffect, useRef, useState } from "react";
import { prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DialogComponent from "../DialogComponent";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { IndicatorContext } from "../provider";

interface Props {
  existingGraphs: string[];
  onRestore: (graphName: string) => void;
}

function deriveNameFromFilename(name: string): string {
  return name.replace(/\.(dump|rdb)$/i, "");
}

function deriveNameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop() ?? "";
    return deriveNameFromFilename(decodeURIComponent(last));
  } catch {
    return "";
  }
}

export default function RestoreGraph({ existingGraphs, onRestore }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [graphName, setGraphName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [replace, setReplace] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { indicator, setIndicator } = useContext(IndicatorContext);

  useEffect(() => {
    if (!open) {
      setGraphName("");
      setFile(null);
      setSourceUrl("");
      setReplace(false);
      setIsLoading(false);
      setTab("upload");
    }
  }, [open]);

  const collides = graphName !== "" && existingGraphs.includes(graphName);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (graphName === "") {
      toast({ title: "Error", description: "Target graph name is required", variant: "destructive" });
      return;
    }

    if (collides && !replace) {
      toast({
        title: "Graph already exists",
        description: `A graph named "${graphName}" exists. Enable Replace to overwrite it.`,
        variant: "destructive",
      });
      return;
    }

    if (tab === "upload" && !file) {
      toast({ title: "Error", description: "Choose a .dump or .rdb file to upload", variant: "destructive" });
      return;
    }

    if (tab === "url" && sourceUrl === "") {
      toast({ title: "Error", description: "Enter a source URL", variant: "destructive" });
      return;
    }

    try {
      setIsLoading(true);
      const path = `api/graph/${prepareArg(graphName)}/restore${replace ? "?replace=true" : ""}`;

      let init: RequestInit;
      if (tab === "upload" && file) {
        const form = new FormData();
        form.append("file", file);
        init = { method: "POST", body: form };
      } else {
        init = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source: sourceUrl, replace }),
        };
      }

      const result = await securedFetch(path, init, toast, setIndicator);
      if (!result.ok) return;

      onRestore(graphName);
      setOpen(false);
      toast({
        title: "Graph restored",
        description: `Graph "${graphName}" was restored successfully.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogComponent
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          className="p-1 text-xs"
          data-testid="restoreGraph"
          variant="Primary"
          label="Restore"
          title="Restore a graph from a .dump file or a remote URL"
        />
      }
      title="Restore a graph"
      description="Load a graph from a .dump file produced by Export, or a presigned URL"
      className="w-[35%]"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "upload" | "url")}>
          <TabsList>
            <TabsTrigger value="upload" data-testid="restoreTabUpload">Upload file</TabsTrigger>
            <TabsTrigger value="url" data-testid="restoreTabUrl">From URL</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".dump,.rdb,application/octet-stream"
              data-testid="restoreFileInput"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(f);
                if (f && graphName === "") setGraphName(deriveNameFromFilename(f.name));
              }}
            />
          </TabsContent>
          <TabsContent value="url" className="mt-4">
            <Input
              data-testid="restoreUrlInput"
              placeholder="https://… or presigned S3 URL"
              value={sourceUrl}
              onChange={(e) => {
                setSourceUrl(e.target.value);
                if (graphName === "") {
                  const derived = deriveNameFromUrl(e.target.value);
                  if (derived) setGraphName(derived);
                }
              }}
            />
          </TabsContent>
        </Tabs>

        <Input
          data-testid="restoreGraphNameInput"
          placeholder="Target graph name"
          value={graphName}
          onChange={(e) => setGraphName(e.target.value)}
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            data-testid="restoreReplaceCheckbox"
            checked={replace}
            onChange={(e) => setReplace(e.target.checked)}
          />
          Replace if a graph with this name already exists
        </label>

        {collides && !replace && (
          <p className="text-sm text-red-500" data-testid="restoreCollisionWarning">
            A graph named &quot;{graphName}&quot; already exists. Enable Replace to overwrite it.
          </p>
        )}

        <div className="flex gap-4">
          <Button
            data-testid="restoreGraphConfirm"
            indicator={indicator}
            variant="Primary"
            label="Restore"
            title="Restore the graph"
            type="submit"
            isLoading={isLoading}
          />
          <Button
            data-testid="restoreGraphCancel"
            variant="Secondary"
            label="Cancel"
            title="Cancel restore"
            onClick={() => setOpen(false)}
          />
        </div>
      </form>
    </DialogComponent>
  );
}
