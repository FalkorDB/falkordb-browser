type Node = { id: number };
type Link = { id: number; source: number; target: number };

export function getGraphAppearance(selection: (Node | Link)[], hover: Node | Link | undefined, links: Link[]) {
    const selectedNodeIds = new Set<number>();
    const selectedLinkIds = new Set<number>();
    const activeNodeIds = new Set<number>();
    for (const element of hover ? [...selection, hover] : selection) {
        if ("source" in element) {
            selectedLinkIds.add(element.id);
            activeNodeIds.add(element.source);
            activeNodeIds.add(element.target);
        } else {
            selectedNodeIds.add(element.id);
            activeNodeIds.add(element.id);
        }
    }

    const activeLinkIds = new Set(selectedLinkIds);
    for (const link of links) {
        if (selectedNodeIds.has(link.source) || selectedNodeIds.has(link.target)) {
            activeNodeIds.add(link.source);
            activeNodeIds.add(link.target);
            activeLinkIds.add(link.id);
        }
    }
    return { selectedNodeIds, selectedLinkIds, activeNodeIds, activeLinkIds };
}

/** Expansion mutates the model outside React, sometimes pushing into the same array. */
export function createGraphAppearanceLookup(selection: (Node | Link)[], hover: Node | Link | undefined, readLinks: () => Link[]) {
    let previousLinks: Link[] | undefined;
    let previousLength = -1;
    let cached: ReturnType<typeof getGraphAppearance> | undefined;
    return () => {
        const links = readLinks();
        if (!cached || links !== previousLinks || links.length !== previousLength) {
            cached = getGraphAppearance(selection, hover, links);
            previousLinks = links;
            previousLength = links.length;
        }
        return cached;
    };
}
