import { isSchemaReservedKey, type Link, type Node } from "../../lib/utils.ts";

export type SearchMatch = { key: string; value: string };

/**
 * Finds what makes an element match the canvas search, case-insensitively and
 * anywhere in the text, so a remembered fragment from the middle of a value is
 * enough. Checks property values first, then the id, relationship type and
 * labels. Surrounding whitespace is ignored, so a stray space doesn't match
 * every value that has one. Returns null when nothing matches or the search
 * is blank.
 */
export function getSearchMatch(el: Node | Link, search: string): SearchMatch | null {
    const lowerSearch = search.trim().toLowerCase();
    if (!lowerSearch) return null;

    for (const [key, value] of Object.entries(el.data)) {
        if (!isSchemaReservedKey(key) && value != null && value.toString().toLowerCase().includes(lowerSearch)) {
            return { key, value: value.toString() };
        }
    }

    if (el.id.toString().toLowerCase().includes(lowerSearch)) {
        return { key: "id", value: el.id.toString() };
    }

    if ("relationship" in el && el.relationship.toLowerCase().includes(lowerSearch)) {
        return { key: "type", value: el.relationship };
    }

    if ("labels" in el) {
        const matchingLabel = el.labels.find(c => c.toLowerCase().includes(lowerSearch));
        if (matchingLabel) {
            return { key: "label", value: matchingLabel };
        }
    }

    return null;
}

/** The elements that match the canvas search, in their original order. */
export function filterSearchElements<T extends Node | Link>(elements: T[], search: string): T[] {
    if (!search.trim()) return [];
    return elements.filter(el => getSearchMatch(el, search) !== null);
}
