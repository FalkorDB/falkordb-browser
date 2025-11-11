import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { formatAttributes } from "./utils";

// Validation schemas
const postBodySchema = z.object({
  type: z.boolean({
    required_error: "Type is required",
    invalid_type_error: "Invalid type",
  }),
  label: z
    .array(z.string(), {
      required_error: "Label is required",
      invalid_type_error: "Invalid label",
    })
    .optional(),
  attributes: z.array(z.tuple([z.string(), z.array(z.string())]), {
    required_error: "Attributes is required",
    invalid_type_error: "Invalid attributes",
  }),
  selectedNodes: z
    .array(
      z.object({
        id: z.number({
          required_error: "SelectedNodes is required",
          invalid_type_error: "Invalid selectedNodes",
        }),
      }),
      {
        required_error: "SelectedNodes is required",
        invalid_type_error: "Invalid selectedNodes",
      }
    )
    .optional(),
});

const deleteBodySchema = z.object({
  type: z.boolean({
    required_error: "Type is required",
    invalid_type_error: "Invalid Type",
  }),
});

// eslint-disable-next-line import/prefer-default-export
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schema: string; element: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { schema } = await params;
    const schemaName = `${schema}_schema`;
    // Parse and validate request body
    const validationResult = postBodySchema.safeParse(await request.json());

    try {
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0].message);
      }

      const { type, label, attributes, selectedNodes } = validationResult.data;
      const formattedAttributes = formatAttributes(attributes);
      const graph = client.selectGraph(schemaName);

      // Build parameterized query
      const queryParams: Record<string, string | number> = {};
      let query: string;

      if (type) {
        // Create node query
        let attributeString = "";
        if (formattedAttributes?.length > 0) {
          const attributeParts = formattedAttributes.map(
            ([k, v]: [string, string], idx: number) => {
              const paramName = `attr_${idx}`;
              queryParams[paramName] = v;
              return `${k}: $${paramName}`;
            }
          );
          attributeString = ` {${attributeParts.join(",")}}`;
        }
        const labelString =
          label && label.length > 0 ? `:${label.join(":")}` : "";
        query = `CREATE (n${labelString}${attributeString}) RETURN n`;
      } else {
        // Create edge query
        queryParams.nodeIdA = selectedNodes![0].id;
        queryParams.nodeIdB = selectedNodes![1].id;

        let attributeString = "";
        if (formattedAttributes?.length > 0) {
          const attributeParts = formattedAttributes.map(
            ([k, v]: [string, string], idx: number) => {
              const paramName = `attr_${idx}`;
              queryParams[paramName] = v;
              return `${k}: $${paramName}`;
            }
          );
          attributeString = ` {${attributeParts.join(",")}}`;
        }
        query = `MATCH (a), (b) WHERE ID(a) = $nodeIdA AND ID(b) = $nodeIdB CREATE (a)-[e:${
          label![0]
        }${attributeString}]->(b) RETURN e`;
      }

      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(query, { params: queryParams })
          : await graph.query(query, { params: queryParams });

      if (!result) throw new Error("Something went wrong");

      return NextResponse.json({ result }, { status: 200 });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ schema: string; element: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { schema, element } = await params;
    const schemaName = `${schema}_schema`;
    const elementId = Number(element);
    // Parse and validate request body
    const validationResult = deleteBodySchema.safeParse(await request.json());

    try {
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0].message);
      }

      const { type } = validationResult.data;
      const graph = client.selectGraph(schemaName);
      const query = type
        ? "MATCH (n) WHERE ID(n) = $elementId DELETE n"
        : "MATCH ()-[e]-() WHERE ID(e) = $elementId DELETE e";
      if (user.role === "Read-Only")
        await graph.roQuery(query, { params: { elementId } });
      else await graph.query(query, { params: { elementId } });

      return NextResponse.json(
        { message: "Element deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}
