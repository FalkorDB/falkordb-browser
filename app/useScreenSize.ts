import { useState, useEffect, useCallback } from 'react';
import throttle from 'lodash/throttle';

type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface ScreenDimension {
  screenSize: ScreenSize | undefined;
  width: number | undefined;
  height: number | undefined;
}

function getScreenSize(width: number): ScreenSize {
  if (width >= 1536) {
    return '2xl';
  }
  if (width >= 1280) {
    return 'xl';
  }
  if (width >= 1024) {
    return 'lg';
  }
  if (width >= 768) {
    return 'md';
  }
  if (width >= 640) {
    return 'sm';
  }
  return 'xs';
}

export default function useScreenSize(): ScreenDimension {
  const [dimension, setDimension] = useState<ScreenDimension>({
    screenSize: undefined, // Default to 'xs'
    width: undefined,
    height: undefined,
  });

  // Define the resize handler
  const handleResize = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Set window width/height and screen size to state
      const newSize = getScreenSize(window.innerWidth);
      setDimension({
        screenSize: newSize,
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  }, []);

  const throttleFunc = throttle(handleResize, 300);

  // Create a throttled version of the resize handler
  const throttledHandleResize = useCallback(
    throttleFunc,
    [handleResize, throttleFunc]
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return () => {};
    }
    // Run the handler immediately to set the initial screen size
    handleResize();

    // Set up the throttled resize listener
    window.addEventListener('resize', throttledHandleResize);

    // Clean up
    return () => {
      throttledHandleResize.cancel(); // Cancel the throttle function on cleanup
      window.removeEventListener('resize', throttledHandleResize);
    };
  }, [handleResize, throttledHandleResize]);

  return dimension;
}