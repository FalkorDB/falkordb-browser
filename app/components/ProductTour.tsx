'use client'

import { useCallback, useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

interface ProductTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const tourSteps: Step[] = [
  {
    target: '[data-testid="GraphsButton"]',
    content: 'Navigate between your graphs and schemas using these buttons. Click "GRAPHS" to view and manage your graph databases.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-testid="SchemasButton"]',
    content: 'Use "SCHEMAS" to view and manage the structure and metadata of your databases.',
    placement: 'right',
  },
  {
    target: '[data-testid="createGraph"]',
    content: 'Create new graphs or schemas using this button. You can build new data structures from scratch.',
    placement: 'right',
    spotlightClicks: true,
  },
  {
    target: '[data-testid="elementCanvasSearchGraph"]',
    content: 'Search for specific elements in your graph. Start typing to find nodes or edges by their properties.',
    placement: 'bottom',
    spotlightClicks: false,
  },
  {
    target: '[data-testid="elementCanvasAddGraph"]',
    content: 'Add new elements to your graph. You can create nodes and edges directly in the visualization.',
    placement: 'left',
    spotlightClicks: false,
  },
  {
    target: '[data-testid="graphTab"]',
    content: 'Switch between different views: Graph visualization, Table view, and Metadata. Each provides different insights into your data.',
    placement: 'top',
    spotlightClicks: false,
  },
  {
    target: '.react-force-graph-container',
    content: 'This is your interactive graph visualization. You can zoom, pan, drag nodes, and click on elements to explore your data.',
    placement: 'center',
    spotlightClicks: false,
  },
  {
    target: '[data-testid="centerControl"]',
    content: 'Use these controls to navigate your graph: center the view, zoom in/out, and control animations.',
    placement: 'left',
    spotlightClicks: false,
  },
  {
    target: '[title="Adjust application settings"]',
    content: 'Access application settings to customize your experience, including query limits and visualization options.',
    placement: 'right',
    spotlightClicks: false,
  },
];

export default function ProductTour({ isOpen, onClose }: ProductTourProps) {
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRun(true);
    }
  }, [isOpen]);

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status } = data;
    
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={tourSteps}
      styles={{
        options: {
          primaryColor: '#3b82f6',
          textColor: '#333',
          backgroundColor: '#fff',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          width: 350,
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 8,
          fontSize: 14,
        },
        tooltipContent: {
          padding: '16px 20px',
        },
        buttonNext: {
          backgroundColor: '#3b82f6',
          border: 'none',
          borderRadius: 6,
          color: '#fff',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 600,
          padding: '8px 16px',
        },
        buttonBack: {
          backgroundColor: 'transparent',
          border: '1px solid #d1d5db',
          borderRadius: 6,
          color: '#374151',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 600,
          padding: '8px 16px',
          marginRight: 8,
        },
        buttonSkip: {
          backgroundColor: 'transparent',
          border: 'none',
          color: '#6b7280',
          cursor: 'pointer',
          fontSize: 14,
          padding: '8px 16px',
        },
      }}
    />
  );
}