import { NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { getCorsHeaders } from "@/app/api/utils";
import { dataGraphName, isOntologyShape, ontologyGraphName } from "@/lib/ontology";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

type NameRow = { label?: string; relationshipType?: string };

const namesOf = (reply: { data?: NameRow[] }, key: keyof NameRow) => (reply.data ?? [])
  .map((row) => row?.[key])
  .filter((name): name is string => typeof name === "string");

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-unused-vars
export async function GET(request: Request) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const { client } = session;

    try {
      const result = await client.list();

      // The schema view derives its structure from the graph itself, so nothing
      // writes a `<name>_schema` graph any more. Deployments upgraded from the
      // versions that did still hold them, and they are not graphs the user
      // picked — keep hiding them rather than re-exposing them here.
      const listed = result.filter((name) => !name.endsWith("_schema"));
      const present = new Set(listed);

      /**
       * An ontology graph is shown through the graph it describes, not on its
       * own, so the pair is collapsed into one entry. Two conditions, because
       * neither is enough alone: the data graph has to be there (an orphaned
       * ontology is hidden by nothing and would just disappear), and the
       * contents have to be an ontology (the name is not evidence — a user can
       * create `foo__ontology` and fill it with their own data).
       */
      const verified = await Promise.all(listed.map(async (name) => {
        const base = dataGraphName(name);

        if (base === undefined || !present.has(base)) return undefined;

        try {
          const graph = client.selectGraph(name);
          // Read-only throughout: a graph must never be created by being listed.
          const [labels, relationshipTypes] = await Promise.all([
            graph.roQuery<NameRow>("CALL db.labels() YIELD label RETURN label"),
            graph.roQuery<NameRow>("CALL db.relationshipTypes() YIELD relationshipType RETURN relationshipType"),
          ]);

          return isOntologyShape(namesOf(labels, "label"), namesOf(relationshipTypes, "relationshipType"))
            ? base
            : undefined;
        } catch (error) {
          // A graph that cannot be read is a graph we cannot vouch for, so it
          // stays an ordinary entry rather than vanishing from the list.
          console.error(error);
          return undefined;
        }
      }));

      const ontologies = verified.filter((base): base is string => base !== undefined);
      const hidden = new Set(ontologies.map(ontologyGraphName));
      const graphNames = listed.filter((name) => !hidden.has(name));

      return NextResponse.json(
        { opts: graphNames, ontologies },
        { status: 200, headers: getCorsHeaders(request) }
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}
