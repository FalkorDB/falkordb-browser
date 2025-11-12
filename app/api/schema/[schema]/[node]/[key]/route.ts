// import { getClient } from "@/app/api/auth/[...nextauth]/options";
// import { NextRequest, NextResponse } from "next/server";
// import { formatAttribute } from "../utils";

// export async function PATCH(
//   request: NextRequest,
//   { params }: { params: Promise<{ schema: string; node: string; key: string }> }
// ) {
//   try {
//     const session = await getClient();

//     if (session instanceof NextResponse) {
//       return session;
//     }

//     const { client, user } = session;
//     const { schema, node, key } = await params;
//     const schemaName = `${schema}_schema`;
//     const { type, attribute } = await request.json();

//     try {
//       if (!attribute) throw new Error("Attribute is required");
//       if (type === undefined) throw new Error("Type is required");

//       const [formattedKey, formattedValue] = formatAttribute([key, attribute]);
//       const graph = client.selectGraph(schemaName);
//       const q = type
//         ? `MATCH (n) WHERE ID(n) = ${node} SET n.${formattedKey} = "${formattedValue}"`
//         : `MATCH (n)-[e]-(m) WHERE ID(e) = ${node} SET e.${formattedKey} = "${formattedValue}"`;
//       const result =
//         user.role === "Read-Only"
//           ? await graph.roQuery(q)
//           : await graph.query(q);

//       if (!result) throw new Error("Something went wrong");

//       return NextResponse.json(
//         { message: "Attribute updated successfully" },
//         { status: 200 }
//       );
//     } catch (error) {
//       console.error(error);
//       return NextResponse.json(
//         { message: (error as Error).message },
//         { status: 400 }
//       );
//     }
//   } catch (err) {
//     return NextResponse.json(
//       { message: (err as Error).message },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: Promise<{ schema: string; node: string; key: string }> }
// ) {
//   try {
//     const session = await getClient();

//     if (session instanceof NextResponse) {
//       return session;
//     }

//     const { client, user } = session;
//     const { schema, node, key } = await params;
//     const schemaName = `${schema}_schema`;
//     const { type } = await request.json();

//     try {
//       if (type === undefined) throw new Error("Type is required");

//       const graph = client.selectGraph(schemaName);
//       const q = type
//         ? `MATCH (n) WHERE ID(n) = ${node} SET n.${key} = NULL`
//         : `MATCH (n)-[e]-(m) WHERE ID(e) = ${node} SET e.${key} = NULL`;
//       const result =
//         user.role === "Read-Only"
//           ? await graph.roQuery(q)
//           : await graph.query(q);

//       if (!result) throw new Error("Something went wrong");

//       return NextResponse.json(
//         { message: "Attribute deleted successfully" },
//         { status: 200 }
//       );
//     } catch (error) {
//       console.error(error);
//       return NextResponse.json(
//         { message: (error as Error).message },
//         { status: 400 }
//       );
//     }
//   } catch (err) {
//     return NextResponse.json(
//       { message: (err as Error).message },
//       { status: 500 }
//     );
//   }
// }
