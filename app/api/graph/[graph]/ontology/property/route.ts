import { NextResponse, NextRequest } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { ontologyGraphName, type OntologyOwnerKind } from "@/lib/ontology";
import {
  upsertOntologyProperty,
  deleteOntologyProperty,
  validateBody,
} from "../../../../validate-body";
import { getCorsHeaders, resolveReadOnly } from "../../../../utils";

/**
 * Editing what a graph's ontology declares.
 *
 * The generic query route takes no Cypher parameters, and a property name is
 * the user's text, so this route exists to bind it rather than to splice it.
 * The Cypher matches the GraphRAG SDK's own ontology store: a property hangs
 * off the entity or relation that declares it, one `:Property` node per owner,
 * so the same name under two owners stays two declarations.
 *
 * The graph in the path is the data graph; where its ontology lives is decided
 * here, so the naming rule stays in one place.
 */

const OWNER_LABELS: Record<OntologyOwnerKind, string> = {
  entity: "Entity",
  relation: "Relation",
};

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
      const validation = validateBody(upsertOntologyProperty, await request.json());

      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400, headers: getCorsHeaders(request) }
        );
      }

      const { ownerKind, owner, name, type } = validation.data;
      const ownerLabel = OWNER_LABELS[ownerKind];
      const graph = client.selectGraph(ontologyGraphName(graphId));

      // MERGE would create the owner as well, declaring an entity nobody asked
      // for, so a missing one is an error rather than a silent creation.
      const result = await graph.query(
        `MATCH (o:${ownerLabel} { label: $owner })
         MERGE (o)-[:HAS_PROPERTY]->(p:Property { label: $name })
         SET p.type = $type
         RETURN count(p) AS declared`,
        { params: { owner, name, type } }
      );

      if (countOf(result, "declared") === 0) {
        return NextResponse.json(
          { message: `The ontology declares no ${ownerKind} "${owner}"` },
          { status: 404, headers: getCorsHeaders(request) }
        );
      }

      return NextResponse.json(
        { message: "Property declared successfully" },
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
      const validation = validateBody(deleteOntologyProperty, await request.json());

      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400, headers: getCorsHeaders(request) }
        );
      }

      const { ownerKind, owner, name } = validation.data;
      const ownerLabel = OWNER_LABELS[ownerKind];
      const graph = client.selectGraph(ontologyGraphName(graphId));
      const pattern = `MATCH (o:${ownerLabel} { label: $owner })-[:HAS_PROPERTY]->(p:Property { label: $name })`;

      // Counted first because a delete reports nothing it can be told apart by:
      // dropping a property that was never declared has to read as an error.
      const found = await graph.query(`${pattern} RETURN count(p) AS declared`, {
        params: { owner, name },
      });

      if (countOf(found, "declared") === 0) {
        return NextResponse.json(
          { message: `"${owner}" declares no property "${name}"` },
          { status: 404, headers: getCorsHeaders(request) }
        );
      }

      await graph.query(`${pattern} DETACH DELETE p`, { params: { owner, name } });

      return NextResponse.json(
        { message: "Property removed successfully" },
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
