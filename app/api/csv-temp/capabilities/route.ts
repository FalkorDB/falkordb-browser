import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders, isRequestOriginTrusted, rejectUntrustedOrigin } from "../../utils";
import { getSessionFromRequest } from "../../auth/[...nextauth]/options";
import { isFileUriLoadSupported, uploadProducesLoadableSource } from "@/app/lib/csv-load-capabilities";
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
 *
 * `uploadEnabled` also answers no where uploading cannot fix anything: a
 * deployment whose uploads come back as `file://` while `file://` is turned off
 * would only produce a second rejected query.
 *
 * Authenticated from the session alone, deliberately: nothing here reads the
 * database, and resolving a client would make a momentarily unreachable
 * connection answer 401. The client fetches this once per session, so that 401
 * would hide the Upload CSV quick fix until the page is reloaded — a database
 * blip disabling a purely client-side affordance.
 */
export async function OPTIONS(request: Request) {
    return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function GET(request: NextRequest) {
    if (!isRequestOriginTrusted(request)) return rejectUntrustedOrigin(request);

    const session = await getSessionFromRequest(request);
    if (!session?.user?.id) {
        return NextResponse.json(
            { message: "Not authenticated" },
            { status: 401, headers: getCorsHeaders(request) }
        );
    }

    return NextResponse.json(
        {
            uploadEnabled: CSV_UPLOAD_ENABLED && uploadProducesLoadableSource(),
            fileUriSupported: isFileUriLoadSupported(),
        },
        { headers: getCorsHeaders(request) }
    );
}
