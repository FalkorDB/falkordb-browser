import { GraphRef } from "@/lib/utils";
import { GraphData } from "../app/api/graph/model";

/**
 * TypeScript declarations for the force-graph custom element
 */

export interface ForceGraphElement extends HTMLElement {
  // Getters
  get GraphData(): GraphData;
  get Theme(): string;
  get DisplayTextPriority(): Array<{ name: string; ignore: boolean }>;
  get CooldownTicks(): number | undefined;
  get Loading(): boolean;
  // Setters
  set GraphData(value: GraphData);
  set Theme(value: string);
  set DisplayTextPriority(value: Array<{ name: string; ignore: boolean }>);
  set CooldownTicks(value: number | undefined);
  set Loading(value: boolean);
  // Methods
  getGraphInstance(): GraphRef["current"];
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "force-graph": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          GraphData?: GraphData;
          Theme?: string;
          DisplayTextPriority?: Array<{ name: string; ignore: boolean }>;
          CooldownTicks?: number | undefined;
          Loading?: boolean;
        },
        HTMLElement
      >;
    }
  }
}

export {};
