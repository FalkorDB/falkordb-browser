'use client'

import { useCallback, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductTourProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to FalkorDB Browser',
    content: 'This tour will guide you through the key features of the FalkorDB Browser. Let\'s get started!',
    target: '',
    placement: 'center',
  },
  {
    id: 'navigation',
    title: 'Navigation',
    content: 'Use these buttons to navigate between your graphs and schemas. Click "GRAPHS" to view and manage your graph databases.',
    target: '[data-testid="GraphsButton"]',
    placement: 'right',
  },
  {
    id: 'schemas',
    title: 'Schema Management',
    content: 'Use "SCHEMAS" to view and manage the structure and metadata of your databases.',
    target: '[data-testid="SchemasButton"]',
    placement: 'right',
  },
  {
    id: 'create',
    title: 'Create New Content',
    content: 'Create new graphs or schemas using this button. You can build new data structures from scratch.',
    target: '[data-testid="createGraph"]',
    placement: 'right',
  },
  {
    id: 'search',
    title: 'Search Elements',
    content: 'Search for specific elements in your graph. Start typing to find nodes or edges by their properties.',
    target: '[data-testid="elementCanvasSearchGraph"]',
    placement: 'bottom',
  },
  {
    id: 'add-elements',
    title: 'Add Elements',
    content: 'Add new elements to your graph. You can create nodes and edges directly in the visualization.',
    target: '[data-testid="elementCanvasAddGraph"]',
    placement: 'left',
  },
  {
    id: 'views',
    title: 'Different Views',
    content: 'Switch between different views: Graph visualization, Table view, and Metadata. Each provides different insights into your data.',
    target: '[data-testid="graphTab"]',
    placement: 'top',
  },
  {
    id: 'visualization',
    title: 'Graph Visualization',
    content: 'This is your interactive graph visualization. You can zoom, pan, drag nodes, and click on elements to explore your data.',
    target: '.react-force-graph-container',
    placement: 'center',
  },
  {
    id: 'controls',
    title: 'Graph Controls',
    content: 'Use these controls to navigate your graph: center the view, zoom in/out, and control animations.',
    target: '[data-testid="centerControl"]',
    placement: 'left',
  },
  {
    id: 'settings',
    title: 'Application Settings',
    content: 'Access application settings to customize your experience, including query limits and visualization options.',
    target: '[title="Adjust application settings"]',
    placement: 'right',
  },
];

export default function ProductTour({ isOpen, onClose }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [showOverlay, setShowOverlay] = useState(false);

  const currentTourStep = tourSteps[currentStep];

  const calculateTooltipPosition = useCallback(() => {
    if (!currentTourStep.target) {
      // Center placement for welcome/completion steps
      setTooltipPosition({
        top: window.innerHeight / 2 - 150,
        left: window.innerWidth / 2 - 200,
      });
      return;
    }

    const element = document.querySelector(currentTourStep.target);
    if (!element) {
      // Fallback to center if element not found
      setTooltipPosition({
        top: window.innerHeight / 2 - 150,
        left: window.innerWidth / 2 - 200,
      });
      return;
    }

    const rect = element.getBoundingClientRect();
    const tooltipWidth = 400;
    const tooltipHeight = 200;
    let top = 0;
    let left = 0;

    switch (currentTourStep.placement) {
      case 'top':
        top = rect.top - tooltipHeight - 20;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + 20;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - 20;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + 20;
        break;
      case 'center':
      default:
        top = window.innerHeight / 2 - tooltipHeight / 2;
        left = window.innerWidth / 2 - tooltipWidth / 2;
        break;
    }

    // Ensure tooltip stays within viewport
    top = Math.max(20, Math.min(top, window.innerHeight - tooltipHeight - 20));
    left = Math.max(20, Math.min(left, window.innerWidth - tooltipWidth - 20));

    setTooltipPosition({ top, left });
  }, [currentTourStep]);

  useEffect(() => {
    if (isOpen) {
      setShowOverlay(true);
      calculateTooltipPosition();
      
      const handleResize = () => {
        calculateTooltipPosition();
      };
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
    setShowOverlay(false);
    return undefined;
  }, [isOpen, currentStep, calculateTooltipPosition]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    onClose();
  };

  if (!isOpen || !showOverlay) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
        onClick={skipTour}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            skipTour();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close tour"
      />
      
      {/* Highlight target element */}
      {currentTourStep.target && (
        <style dangerouslySetInnerHTML={{
          __html: `
            ${currentTourStep.target} {
              position: relative !important;
              z-index: 9999 !important;
              box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3) !important;
              border-radius: 4px !important;
            }
          `
        }} />
      )}
      
      {/* Tour tooltip */}
      <Card 
        className="fixed w-[400px] bg-white border shadow-lg z-[10000]"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
        }}
      >
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {currentTourStep.title}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTour}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pb-4">
          <p className="text-gray-700 leading-relaxed">
            {currentTourStep.content}
          </p>
        </CardContent>
        
        <CardFooter className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {currentStep + 1} of {tourSteps.length}
            </span>
            <div className="flex space-x-1">
              {tourSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={skipTour}
            >
              Skip
            </Button>
            <Button
              size="sm"
              onClick={nextStep}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
              {currentStep !== tourSteps.length - 1 && (
                <ChevronRight className="h-4 w-4 ml-1" />
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}