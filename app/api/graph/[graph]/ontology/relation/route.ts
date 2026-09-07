import { NextResponse, NextRequest } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { ontologyGraphName } from "@/lib/ontology";
import {
  upsertOntologyRelation,
  deleteOntologyRelation,
  validateBody,
} from "../../../../validate-body";
import { getCorsHeaders, resolveReadOnly } from "../../../../utils";

/**
 * Declaring and undeclaring the relations of a graph's ontology.
 *
 * The GraphRAG SDK stores one `:Relation` node per (label, source, target)
 * triple, wired to its endpoints with `:SOURCE` and `:TARGET`, so the same
 * label declared between another pair of entities is a separate declaration —
 * which is why every request here carries all three.
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
      const validation = validateBody(upsertOntologyRelation, await request.json());

      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400, headers: getCorsHeaders(request) }
        );
      }

      const { label, source, target, description } = validation.data;
      const graph = client.selectGraph(ontologyGraphName(graphId));

      const found = await graph.query(
        `MATCH (r:Relation { label: $label })-[:SOURCE]->(:Entity { label: $source })
         MATCH (r)-[:TARGET]->(:Entity { label: $target })
         RETURN count(r) AS declared`,
        { params: { label, source, target } }
      );

      if (countOf(found, "declared") !== 0) {
        return NextResponse.json(
          { message: `The ontology already declares "${source}"-[${label}]->"${target}"` },
          { status: 409, headers: getCorsHeaders(request) }
        );
      }

      // Both endpoints have to already be declared: creating them here would
      // add entities nobody asked for, so a missing one is an error.
      const created = await graph.query(
        `MATCH (s:Entity { label: $source })
         MATCH (t:Entity { label: $target })
         CREATE (s)<-[:SOURCE]-(r:Relation { label: $label, description: $description })-[:TARGET]->(t)
         RETURN count(r) AS declared`,
        { params: { label, source, target, description: description ?? "" } }
      );

      if (countOf(created, "declared") === 0) {
        return NextResponse.json(
          { message: `The ontology declares no entity "${source}" or "${target}"` },
          { status: 404, headers: getCorsHeaders(request) }
        );
      }

      return NextResponse.json(
        { message: "Relation declared successfully" },
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
      const validation = validateBody(deleteOntologyRelation, await request.json());

      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400, headers: getCorsHeaders(request) }
        );
      }

      const { label, source, target } = validation.data;
      const graph = client.selectGraph(ontologyGraphName(graphId));
      const pattern = `MATCH (r:Relation { label: $label })-[:SOURCE]->(:Entity { label: $source })
         MATCH (r)-[:TARGET]->(:Entity { label: $target })`;

      // Counted first because a delete reports nothing it can be told apart by:
      // dropping a relation that was never declared has to read as an error.
      const found = await graph.query(`${pattern} RETURN count(r) AS declared`, {
        params: { label, source, target },
      });

      if (countOf(found, "declared") === 0) {
        return NextResponse.json(
          { message: `The ontology declares no "${source}"-[${label}]->"${target}"` },
          { status: 404, headers: getCorsHeaders(request) }
        );
      }

      // The properties hang off the relation and nothing else, so they go too.
      await graph.query(
        `${pattern}
         OPTIONAL MATCH (r)-[:HAS_PROPERTY]->(p:Property)
         DETACH DELETE r, p`,
        { params: { label, source, target } }
      );

      return NextResponse.json(
        { message: "Relation removed successfully" },
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
