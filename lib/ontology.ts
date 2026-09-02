/**
 * Telling an ontology graph apart from a graph a user happens to have named
 * like one.
 *
 * The GraphRAG SDK stores a graph's ontology in a second graph named
 * `<graph>__ontology`. The name on its own proves nothing — anyone with
 * `GRAPH.QUERY` can create `foo__ontology` — so the name is only used to pick
 * cheap candidates, and the shape below is what decides.
 *
 * That check is self-validating: an ontology graph holds nothing but the three
 * labels and three relationship types the SDK writes, so a graph that passes
 * *is* an ontology whoever wrote it, and one that fails stays an ordinary
 * graph. Neither outcome misreads the user's data, which is why no unforgeable
 * marker is needed.
 */

export const ONTOLOGY_GRAPH_SUFFIX = "__ontology";

/** Every node label the SDK's ontology graph contains. */
export const ONTOLOGY_LABELS = ["Entity", "Relation", "Property"];

/** Every relationship type the SDK's ontology graph contains. */
export const ONTOLOGY_RELATIONSHIP_TYPES = ["HAS_PROPERTY", "SOURCE", "TARGET"];

const LABELS = new Set(ONTOLOGY_LABELS);
const RELATIONSHIP_TYPES = new Set(ONTOLOGY_RELATIONSHIP_TYPES);

/** Where the ontology of `name` is stored. */
export const ontologyGraphName = (name: string) => `${name}${ONTOLOGY_GRAPH_SUFFIX}`;

/** The graph an ontology graph describes, or undefined when the name is not one. */
export const dataGraphName = (name: string) => (
  name.length > ONTOLOGY_GRAPH_SUFFIX.length && name.endsWith(ONTOLOGY_GRAPH_SUFFIX)
    ? name.slice(0, -ONTOLOGY_GRAPH_SUFFIX.length)
    : undefined
);

/**
 * Whether a graph holding these labels and relationship types is an ontology.
 *
 * A subset rather than an exact match: an ontology that declares no relations
 * has no `Relation` nodes, and one that declares no properties has no
 * `HAS_PROPERTY` edges. An empty graph is not an ontology — it is just empty,
 * and hiding it would lose it.
 */
export const isOntologyShape = (labels: string[], relationshipTypes: string[]) => (
  labels.length > 0
  && labels.every((label) => LABELS.has(label))
  && relationshipTypes.every((type) => RELATIONSHIP_TYPES.has(type))
);

/** The types a graph's ontology declares, whether or not the data uses them. */
export type OntologyTypeNames = { labels: string[]; relationshipTypes: string[] };

/** Shared so clearing the declared types is a no-op for identity comparisons. */
export const EMPTY_ONTOLOGY_TYPES: OntologyTypeNames = { labels: [], relationshipTypes: [] };

/**
 * The meta stats a graph reports, plus the types its ontology declares and the
 * data has no instance of. Those carry a count of 0, which is also what spares
 * `GraphInfo.createLabel` a meta-stats query for a type it would find nothing
 * for. Adding them here rather than after the fact is what gets them a color
 * and a place in the vocabulary everywhere the graph info is read.
 */
export const withDeclaredTypes = (
  stats: [string, number][],
  declared: string[],
): [string, number][] => {
  if (declared.length === 0) return stats;

  const counted = new Set(stats.map(([name]) => name));

  return [...stats, ...declared.filter((name) => !counted.has(name)).map((name): [string, number] => [name, 0])];
};

/** Which of the two kinds of declaration a property hangs off. */
export type OntologyOwnerKind = "entity" | "relation";

/**
 * What the SDK stores in `Property.type`, against how the Schema view names it.
 * The right-hand side is the vocabulary `typeOf()` reports, so a declared
 * schema and a discovered one read alike.
 */
export const ONTOLOGY_PROPERTY_TYPES: Record<string, string> = {
  STRING: "String",
  INTEGER: "Integer",
  FLOAT: "Double",
  BOOLEAN: "Boolean",
  DATE: "Date",
  LIST: "Array",
};

/** How a declared type is shown. One with no equivalent is shown as declared. */
export const ontologyPropertyType = (type: unknown) => {
  if (typeof type !== "string" || !type) return "String";

  const declared = type.trim().toUpperCase();

  return ONTOLOGY_PROPERTY_TYPES[declared]
    ?? declared.charAt(0) + declared.slice(1).toLowerCase();
};

/** The types the editor offers, as they are shown. */
export const ONTOLOGY_PROPERTY_TYPE_NAMES = Object.values(ONTOLOGY_PROPERTY_TYPES);

/**
 * The type to declare for a shown name. An unrecognized one is written back
 * uppercased, which is what an ontology the SDK did not write may hold.
 */
export const ontologyDeclaredType = (name: string) => (
  Object.keys(ONTOLOGY_PROPERTY_TYPES).find((declared) => ONTOLOGY_PROPERTY_TYPES[declared] === name)
  ?? name.trim().toUpperCase()
);
