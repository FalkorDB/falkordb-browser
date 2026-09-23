"use client";

import { ReactNode, RefObject, Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { CustomizingRef, Panel, cn } from "@/lib/utils";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { PanelImperativeHandle, PanelSize } from "react-resizable-panels";
import { PanelLeft } from "lucide-react";
import useIsMobile from "@/lib/useIsMobile";
import BottomSheet from "@/components/ui/BottomSheet";
import { PanelContext } from "./provider";
import Header from "./Header";
import Navbar from "./Navbar";
import Tutorial, { DemoLoadOutcome } from "./Tutorial";

const UdfPanel = dynamic(() => import("../udf/udfPanel"), {
  ssr: false,
});

interface ProviderLayoutProps {
  children: ReactNode;
  panelRef: RefObject<PanelImperativeHandle | null>;
  /** Lifted so the active tab can carry it; see `PanelContextType`. */
  customizingLabel: CustomizingRef | null;
  setCustomizingLabel: Dispatch<SetStateAction<CustomizingRef | null>>;
  tutorialOpen: boolean;
  onCloseTutorial: () => void;
  onLoadDemoGraphs: () => Promise<DemoLoadOutcome>;
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
  const isMobile = useIsMobile();
  const showNavbarAndHeader = pathname !== "/" && pathname !== "/login";
  const isGraph = pathname === "/graph";
  const isUdf = pathname === "/udf";

  const [panel, setPanel] = useState<Panel>();
  const [isCollapsed, setIsCollapsed] = useState(true);
  // Mobile renders the graph info as a sheet rather than a resizable panel, so its
  // open state has to live in React instead of the panel's imperative handle.
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [udfSheetOpen, setUdfSheetOpen] = useState(false);
  const [mobileNavSlot, setMobileNavSlot] = useState<HTMLDivElement | null>(null);
  const [mobileToolbarSlot, setMobileToolbarSlot] = useState<HTMLDivElement | null>(null);
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
    if (isMobile) {
      setMobilePanelOpen((open) => !open);
      return;
    }

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
  }, [panelRef, isMobile]);

  // Auto-expand the graph info panel and restore its persisted width on /graph.
  useEffect(() => {
    if (!isGraph) {
      setIsCollapsed(true);
      setMobilePanelOpen(false);
      return undefined;
    }

    // Mobile shows the info as a sheet, so there is no panel group to drive. The
    // ref can still hold a handle from the desktop tree rendered before hydration
    // corrected the breakpoint, and driving that handle throws "Group not found".
    if (isMobile) return undefined;

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
  }, [isGraph, panelRef, isMobile]);

  // Restore the UDF panel's persisted width on /udf.
  useEffect(() => {
    // `ProviderLayout` outlives the route, so without this the sheet is still open
    // on the way back and covers the page before the user asks for it.
    if (!isUdf) {
      setUdfSheetOpen(false);
      return undefined;
    }

    if (isMobile) return undefined;

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
  }, [isUdf, isMobile]);

  const panelContext = useMemo(() => ({
    panel,
    setPanel,
    panelOpen: isMobile ? mobilePanelOpen : !isCollapsed,
    onTogglePanel: onExpand,
    infoPanelRef: panelRef,
    onInfoPanelResize,
    customizingLabel,
    setCustomizingLabel,
    mobileNavSlot,
    mobileToolbarSlot,
  }), [panel, isCollapsed, isMobile, mobilePanelOpen, onExpand, panelRef, onInfoPanelResize, customizingLabel, setCustomizingLabel, mobileNavSlot, mobileToolbarSlot]);

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
        <Header
          mobileLeading={
            isMobile
              ? <>
                <Navbar showUDF={showUDF} />
                {
                  isUdf &&
                  <button
                    type="button"
                    data-testid="mobileUdfPanelToggle"
                    aria-pressed={udfSheetOpen}
                    className={cn("shrink-0 rounded-lg p-1.5 hover:bg-secondary", udfSheetOpen && "text-primary")}
                    title="Functions"
                    onClick={() => setUdfSheetOpen(open => !open)}
                  >
                    <PanelLeft size={18} />
                  </button>
                }
              </>
              : null
          }
        />
      }
      {
        // Only /graph has a switcher to show, so every other route gets the row
        // back rather than paying for an empty strip. The trailing slot lets the
        // route hang its toolbar actions off the same row.
        showNavbarAndHeader && isMobile && isGraph &&
        <div className="shrink-0 flex items-center gap-2 h-11 px-2 border-b border-border/50">
          <div ref={setMobileNavSlot} className="min-w-0 grow flex items-center" />
          <div ref={setMobileToolbarSlot} className="shrink-0 h-full py-1 flex items-center gap-1" />
        </div>
      }
      <div className="basis-0 grow min-h-0 flex">
        {
          showNavbarAndHeader && !isMobile &&
          <Navbar showUDF={showUDF} />
        }
        {
          isUdf && !isMobile ?
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
            <div className="w-1 grow min-h-0 relative">
              {children}
              {
                isUdf && isMobile &&
                <BottomSheet
                  open={udfSheetOpen}
                  onClose={() => setUdfSheetOpen(false)}
                  title="Functions"
                  height="full"
                  data-testid="mobileUdfSheet"
                >
                  <UdfPanel />
                </BottomSheet>
              }
            </div>
        }
      </div>
    </PanelContext.Provider>
  );
}
