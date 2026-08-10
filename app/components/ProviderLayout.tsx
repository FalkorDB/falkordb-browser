"use client";

import { ReactNode, RefObject, Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Panel } from "@/lib/utils";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { PanelImperativeHandle, PanelSize } from "react-resizable-panels";
import { PanelContext } from "./provider";
import Header from "./Header";
import Navbar from "./Navbar";
import Tutorial from "./Tutorial";

const UdfPanel = dynamic(() => import("../udf/udfPanel"), {
  ssr: false,
});

interface ProviderLayoutProps {
  children: ReactNode;
  panelRef: RefObject<PanelImperativeHandle | null>;
  /** Lifted so the active tab can carry it; see `PanelContextType`. */
  customizingLabel: string | null;
  setCustomizingLabel: Dispatch<SetStateAction<string | null>>;
  tutorialOpen: boolean;
  onCloseTutorial: () => void;
  onLoadDemoGraphs: () => Promise<void>;
  onCleanupDemoGraphs: () => Promise<void>;
  showUDF: boolean;
}

export default function ProviderLayout({
  children,
  panelRef,
  customizingLabel,
  setCustomizingLabel,
  tutorialOpen,
  onCloseTutorial,
  onLoadDemoGraphs,
  onCleanupDemoGraphs,
  showUDF,
}: ProviderLayoutProps) {
  const pathname = usePathname();
  const showNavbarAndHeader = pathname !== "/" && pathname !== "/login";
  const isGraph = pathname === "/graph";
  const isUdf = pathname === "/udf";

  const [panel, setPanel] = useState<Panel>();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const isRestoringSize = useRef(false);
  const udfPanelRef = useRef<PanelImperativeHandle>(null);
  const isRestoringUdfSize = useRef(false);

  // The graph info panel is rendered by the /graph route so a sub-header can span
  // both it and the graph view, but its state lives here where `Tutorial` (a
  // sibling of the route) and `Selector` can also drive it.
  const onInfoPanelResize = useCallback((size: PanelSize) => {
    setIsCollapsed(size.asPercentage === 0);
    if (!isRestoringSize.current && size.asPercentage > 0) {
      localStorage.setItem("panel-size-/graph", JSON.stringify(size.asPercentage));
    }
  }, []);

  const onUdfPanelResize = useCallback((size: PanelSize) => {
    if (!isRestoringUdfSize.current && size.asPercentage > 0) {
      localStorage.setItem("panel-size-/udf", JSON.stringify(size.asPercentage));
    }
  }, []);

  const onExpand = useCallback(() => {
    const currentPanel = panelRef.current;
    if (!currentPanel) return;
    if (currentPanel.isCollapsed()) {
      currentPanel.expand();
      const stored = localStorage.getItem("panel-size-/graph");
      if (stored) {
        isRestoringSize.current = true;
        requestAnimationFrame(() => {
          currentPanel.resize(`${JSON.parse(stored)}%`);
          requestAnimationFrame(() => {
            isRestoringSize.current = false;
          });
        });
      }
    } else {
      currentPanel.collapse();
    }
  }, [panelRef]);

  // Auto-expand the graph info panel and restore its persisted width on /graph.
  useEffect(() => {
    if (!isGraph) {
      setIsCollapsed(true);
      return undefined;
    }

    const currentPanel = panelRef.current;
    if (!currentPanel) return undefined;

    if (currentPanel.isCollapsed()) currentPanel.expand();

    const stored = localStorage.getItem("panel-size-/graph");
    if (!stored) return undefined;

    isRestoringSize.current = true;
    const rafId = requestAnimationFrame(() => {
      currentPanel.resize(`${JSON.parse(stored)}%`);
      // Allow saves again after the restore settles
      requestAnimationFrame(() => {
        isRestoringSize.current = false;
      });
    });

    return () => cancelAnimationFrame(rafId);
  }, [isGraph, panelRef]);

  // Restore the UDF panel's persisted width on /udf.
  useEffect(() => {
    if (!isUdf) return undefined;

    const currentPanel = udfPanelRef.current;
    if (!currentPanel) return undefined;

    const stored = localStorage.getItem("panel-size-/udf");
    if (!stored) return undefined;

    isRestoringUdfSize.current = true;
    const rafId = requestAnimationFrame(() => {
      currentPanel.resize(`${JSON.parse(stored)}%`);
      requestAnimationFrame(() => {
        isRestoringUdfSize.current = false;
      });
    });

    return () => cancelAnimationFrame(rafId);
  }, [isUdf]);

  const panelContext = useMemo(() => ({
    panel,
    setPanel,
    panelOpen: !isCollapsed,
    onTogglePanel: onExpand,
    infoPanelRef: panelRef,
    onInfoPanelResize,
    customizingLabel,
    setCustomizingLabel,
  }), [panel, isCollapsed, onExpand, panelRef, onInfoPanelResize, customizingLabel, setCustomizingLabel]);

  return (
    <PanelContext.Provider value={panelContext}>
      {
        isGraph &&
        <Tutorial
          open={tutorialOpen}
          onClose={onCloseTutorial}
          onLoadDemoGraphs={onLoadDemoGraphs}
          onCleanupDemoGraphs={onCleanupDemoGraphs}
        />
      }
      {
        showNavbarAndHeader &&
        <Header />
      }
      <div className="basis-0 grow min-h-0 flex">
        {
          showNavbarAndHeader &&
          <Navbar showUDF={showUDF} />
        }
        {
          isUdf ?
            <ResizablePanelGroup orientation="horizontal" className="w-1 grow">
              <ResizablePanel
                panelRef={udfPanelRef}
                defaultSize="20%"
                minSize="15%"
                maxSize="30%"
                onResize={onUdfPanelResize}
              >
                <UdfPanel />
              </ResizablePanel>
              <ResizableHandle withHandle className="bg-border" />
              <ResizablePanel
                defaultSize="80%"
                minSize="70%"
                maxSize="100%"
              >
                {children}
              </ResizablePanel>
            </ResizablePanelGroup>
            :
            <div className="w-1 grow min-h-0">
              {children}
            </div>
        }
      </div>
    </PanelContext.Provider>
  );
}
