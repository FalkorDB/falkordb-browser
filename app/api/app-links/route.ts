import { NextResponse } from "next/server";
import { getCorsHeaders, corsPreflight } from "@/app/api/utils";
import { readAppLinks } from "@/lib/appDownload";

export const OPTIONS = corsPreflight;

/**
 * GET /api/app-links
 *
 * The store links for the phone apps (ANDROID_APP_URL / IOS_APP_URL), read at
 * request time so one image can serve every deployment. Unauthenticated: the
 * links are public store pages.
 */
// eslint-disable-next-line import/prefer-default-export
export async function GET(request: Request) {
  return NextResponse.json(readAppLinks(process.env), {
    status: 200,
    headers: { ...getCorsHeaders(request), "Cache-Control": "no-store" },
  });
}
