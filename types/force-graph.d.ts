import { GraphData } from '../app/api/graph/model';

/**
 * TypeScript declarations for the force-graph custom element
 */
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'force-graph': React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement> & {
                    data?: string;
                    theme?: string;
                    graphDataProp?: GraphData;
                    themeProp?: string;
                    displayTextPriorityProp?: Array<{ name: string; ignore: boolean }>;
                    cooldownTicksProp?: number | undefined;
                    loadingProp?: boolean;
                },
                HTMLElement
            >;
        }
    }
}

export {};

