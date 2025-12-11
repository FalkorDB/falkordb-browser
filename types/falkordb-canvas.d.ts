// Global type declarations for FalkorDB custom elements
// This file extends JSX.IntrinsicElements to include our custom web components

/// <reference types="react" />

declare namespace JSX {
  interface IntrinsicElements {
    'falkordb-canvas': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
  }
}

