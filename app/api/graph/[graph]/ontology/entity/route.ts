import { NextResponse, NextRequest } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { ontologyGraphName } from "@/lib/ontology";
import {
  upsertOntologyEntity,
  deleteOntologyEntity,
  validateBody,
} from "../../../../validate-body";
import { getCorsHeaders, resolveReadOnly } from "../../../../utils";

/**
 * Declaring and undeclaring the entities of a graph's ontology.
 *
 * Same shape as the property route next door: the label is the user's text, so
 * it is bound as a parameter rather than spliced, and the graph in the path is
 * the data graph whose ontology this edits.
 */

const countOf = (result: { data?: unknown[] } | undefined, key: string) => {
  const row = result?.data?.[0] as Record<string, unknown> | undefined;

  return Number(row?.[key] ?? 0);
};

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string }> }
) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { graph: graphId } = await params;

    if (resolveReadOnly(request, user.role)) {
      return NextResponse.json(
        { message: "Forbidden: read-only connection" },
        { status: 403, headers: getCorsHeaders(request) }
      );
    }

    try {
      const validation = validateBody(upsertOntologyEntity, await request.json());

      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400, headers: getCorsHeaders(request) }
        );
      }

      const { label, description } = validation.data;
      const graph = client.selectGraph(ontologyGraphName(graphId));

      // Declaring the same entity twice would silently merge into the first and
      // read as success, so an existing one is a conflict rather than a no-op.
      const found = await graph.query(
        "MATCH (e:Entity { label: $label }) RETURN count(e) AS declared",
        { params: { label } }
      );

      if (countOf(found, "declared") !== 0) {
        return NextResponse.json(
          { message: `The ontology already declares an entity "${label}"` },
          { status: 409, headers: getCorsHeaders(request) }
        );
      }

      await graph.query("CREATE (:Entity { label: $label, description: $description })", {
        params: { label, description: description ?? "" },
      });

      return NextResponse.json(
        { message: "Entity declared successfully" },
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string }> }
) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { graph: graphId } = await params;

    if (resolveReadOnly(request, user.role)) {
      return NextResponse.json(
        { message: "Forbidden: read-only connection" },
        { status: 403, headers: getCorsHeaders(request) }
      );
    }

    try {
      const validation = validateBody(deleteOntologyEntity, await request.json());

      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400, headers: getCorsHeaders(request) }
        );
      }

      const { label } = validation.data;
      const graph = client.selectGraph(ontologyGraphName(graphId));

      // Counted first because a delete reports nothing it can be told apart by:
      // dropping an entity that was never declared has to read as an error.
      const found = await graph.query(
        "MATCH (e:Entity { label: $label }) RETURN count(e) AS declared",
        { params: { label } }
      );

      if (countOf(found, "declared") === 0) {
        return NextResponse.json(
          { message: `The ontology declares no entity "${label}"` },
          { status: 404, headers: getCorsHeaders(request) }
        );
      }

      // A relation is declared between two entities, so one that loses an
      // endpoint no longer describes anything and goes with it — along with
      // every property either of them declared, which hangs off nothing else.
      await graph.query(
        `MATCH (e:Entity { label: $label })<-[:SOURCE|TARGET]-(r:Relation)
         OPTIONAL MATCH (r)-[:HAS_PROPERTY]->(p:Property)
         DETACH DELETE r, p`,
        { params: { label } }
      );
      await graph.query(
        `MATCH (e:Entity { label: $label })
         OPTIONAL MATCH (e)-[:HAS_PROPERTY]->(p:Property)
         DETACH DELETE e, p`,
        { params: { label } }
      );

      return NextResponse.json(
        { message: "Entity removed successfully" },
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
