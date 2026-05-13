"use client";

import { ReactNode, RefObject, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { cn, InfoLabel, Panel } from "@/lib/utils";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { PanelImperativeHandle, PanelSize } from "react-resizable-panels";
import { PanelContext } from "./provider";
import Header from "./Header";
import Navbar from "./Navbar";
import Tutorial from "./Tutorial";

const GraphInfoPanel = dynamic(() => import("../graph/graphInfo"), {
  ssr: false,
});

const UdfPanel = dynamic(() => import("../udf/udfPanel"), {
  ssr: false,
});

interface ProviderLayoutProps {
  children: ReactNode;
  panelRef: RefObject<PanelImperativeHandle | null>;
  tutorialOpen: boolean;
  onCloseTutorial: () => void;
  onLoadDemoGraphs: () => Promise<void>;
  onCleanupDemoGraphs: () => Promise<void>;
  showUDF: boolean;
}

export default function ProviderLayout({
  children,
  panelRef,
  tutorialOpen,
  onCloseTutorial,
  onLoadDemoGraphs,
  onCleanupDemoGraphs,
  showUDF,
}: ProviderLayoutProps) {
  const pathname = usePathname();
  const showNavbarAndHeader = pathname !== "/" && pathname !== "/login";

  const [panel, setPanel] = useState<Panel>();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [customizingLabel, setCustomizingLabel] = useState<InfoLabel | null>(null);

  const onPanelResize = useCallback((size: PanelSize) => {
    setIsCollapsed(size.asPercentage === 0);
  }, []);

  const onExpand = useCallback(() => {
    const currentPanel = panelRef.current;
    if (!currentPanel) return;
    if (currentPanel.isCollapsed()) {
      currentPanel.expand();
    } else {
      currentPanel.collapse();
    }
  }, [panelRef]);

  // Auto-expand panel on /graph and /udf, collapse on other routes
  useEffect(() => {
    const currentPanel = panelRef.current;
    if (!currentPanel) return;

    let rafId: number | undefined;

    if (pathname === "/graph" || pathname === "/udf") {
      if (currentPanel.isCollapsed()) currentPanel.expand();
    } else if (!currentPanel.isCollapsed()) {
      rafId = requestAnimationFrame(() => {
        if (!currentPanel.isCollapsed()) currentPanel.collapse();
      });
    }

    return () => {
      if (rafId !== undefined) cancelAnimationFrame(rafId);
    };
  }, [pathname, panelRef]);

  const panelContext = useMemo(() => ({
    panel,
    setPanel,
    panelOpen: !isCollapsed,
    onTogglePanel: onExpand,
  }), [panel, isCollapsed, onExpand]);

  return (
    <PanelContext.Provider value={panelContext}>
      {
        pathname === "/graph" &&
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
        <ResizablePanelGroup orientation="horizontal" className="w-1 grow">
          <ResizablePanel
            panelRef={panelRef}
            defaultSize="0%"
            collapsible={pathname !== "/udf"}
            minSize="15%"
            maxSize="30%"
            onResize={onPanelResize}
            data-testid="graphInfoPanel"
          >
            {
              pathname === "/udf" ?
                <UdfPanel />
                : pathname === "/graph" &&
                <GraphInfoPanel
                  onClose={onExpand}
                  customizingLabel={customizingLabel}
                  setCustomizingLabel={setCustomizingLabel}
                />
            }
          </ResizablePanel>
          <ResizableHandle
            withHandle
            onMouseUp={() => isCollapsed && onExpand()}
            className={cn("bg-border", isCollapsed && "hidden")}
            disabled={isCollapsed}
          />
          <ResizablePanel
            defaultSize="100%"
            minSize="70%"
            maxSize="100%"
          >
            {
              (pathname === "/graph") ?
                <div className="h-full w-full flex flex-col">
                  {children}
                  <div className="h-4 w-full Gradient" />
                </div>
                :
                children
            }
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </PanelContext.Provider>
  );
}
