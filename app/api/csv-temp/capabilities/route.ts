import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders } from "../../utils";
import { getClient } from "../../auth/[...nextauth]/options";
import { isFileUriLoadSupported } from "@/app/lib/csv-load-capabilities";
import { CSV_UPLOAD_ENABLED } from "@/lib/graphUpload";

/**
 * Report what this deployment can do with `LOAD CSV`, so the editor can tell a
 * user that a query is going to fail *before* sending it — and offer the upload
 * flow when uploading the file is the fix.
 *
 * Both answers are deployment-wide configuration, not per-user data — whether
 * *this* caller may upload is their read-only state, which the client already
 * tracks per connection and applies to the answer. Keeping the role out of here
 * is what lets a single fetch survive a connection switch. The route is still
 * session-guarded so an unauthenticated caller cannot enumerate how the instance
 * is wired up, and the upload routes enforce the role themselves.
 */
export async function OPTIONS(request: Request) {
    return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function GET(request: NextRequest) {
    const session = await getClient(request);
    if (session instanceof NextResponse) return session;

    return NextResponse.json(
        {
            uploadEnabled: CSV_UPLOAD_ENABLED,
            fileUriSupported: isFileUriLoadSupported(),
        },
        { headers: getCorsHeaders(request) }
    );
}
