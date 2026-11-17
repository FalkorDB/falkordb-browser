import { NextResponse, NextRequest } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { quoteCypherIdentifier } from "@/lib/cypher";
import { VALUE_EXPRESSIONS } from "@/lib/graphValues";
import {
  updateGraphElementAttribute,
  deleteGraphElementAttribute,
  validateBody,
} from "../../../../validate-body";
import { getCorsHeaders, resolveReadOnly, corsPreflight } from "../../../../utils";

export const OPTIONS = corsPreflight;

export async function POST(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ graph: string; element: string; key: string }> }
) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { graph: graphId, element, key: routeKey } = await params;
    const key = request.nextUrl.searchParams.get("propertyKey") ?? routeKey;

    if (!key) {
      return NextResponse.json(
        { message: "Property key must not be empty" },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }

    const elementId = Number(element);
    const isReadOnly = resolveReadOnly(request, user.role);

    try {
      const body = await request.json();

      // Validate request body
      const validation = validateBody(updateGraphElementAttribute, body);

      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400, headers: getCorsHeaders(request) }
        );
      }

      const { value, type, valueType, addOnly = false } = validation.data;
      const graph = client.selectGraph(graphId);

      if (isReadOnly) {
        return NextResponse.json(
          { message: "Forbidden: read-only connection" },
          { status: 403, headers: getCorsHeaders(request) }
        );
      }

      // Points, vectors and the temporal types cannot be expressed by a
      // parameter alone, so the parameter feeds the function that builds them.
      const valueExpression = VALUE_EXPRESSIONS[valueType ?? "string"];
      // The key comes from the URL and names a property, so it cannot be bound
      // as a parameter: it is quoted instead.
      const quotedKey = quoteCypherIdentifier(key);
      const entity = type ? "n" : "e";
      const match = type
        ? `MATCH (n) WHERE ID(n) = $id`
        : `MATCH ()-[e]->() WHERE ID(e) = $id`;

      if (addOnly) {
        const query = `${match}
          WITH ${entity}, ${entity}.${quotedKey} IS NOT NULL AS propertyExists
          SET ${entity}.${quotedKey} = CASE
            WHEN propertyExists THEN ${entity}.${quotedKey}
            ELSE ${valueExpression}
          END
          RETURN propertyExists AS propertyExists`;
        const result = await graph.query(query, { params: { id: elementId, value } });
        const row = result.data?.[0];

        if (typeof row === "object" && row !== null
          && "propertyExists" in row && row.propertyExists === true) {
          return NextResponse.json(
            { message: "An attribute with this key already exists" },
            { status: 409, headers: getCorsHeaders(request) }
          );
        }
      } else {
        await graph.query(`${match} SET ${entity}.${quotedKey} = ${valueExpression}`, {
          params: { id: elementId, value },
        });
      }

      return NextResponse.json(
        { message: "Attribute updated successfully" },
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
  {
    params,
  }: { params: Promise<{ graph: string; element: string; key: string }> }
) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;

    const { graph: graphId, element, key: routeKey } = await params;
    const key = request.nextUrl.searchParams.get("propertyKey") ?? routeKey;

    if (!key) {
      return NextResponse.json(
        { message: "Property key must not be empty" },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }

    const elementId = Number(element);
    const isReadOnly = resolveReadOnly(request, user.role);

    try {
      const body = await request.json();

      // Validate request body
      const validation = validateBody(deleteGraphElementAttribute, body);

      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400, headers: getCorsHeaders(request) }
        );
      }

      const { type } = validation.data;
      const graph = client.selectGraph(graphId);

      if (isReadOnly) {
        return NextResponse.json(
          { message: "Forbidden: read-only connection" },
          { status: 403, headers: getCorsHeaders(request) }
        );
      }

      const quotedKey = quoteCypherIdentifier(key);

      const query = type
        ? `MATCH (n) WHERE ID(n) = $id SET n.${quotedKey} = NULL`
        : `MATCH ()-[e]->() WHERE ID(e) = $id SET e.${quotedKey} = NULL`;

      await graph.query(query, { params: { id: elementId } });

      return NextResponse.json(
        { message: "Attribute deleted successfully" },
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
