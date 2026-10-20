import { NextResponse } from "next/server";
import { isGitHubReleaseFile, readAppLinks, resolveReleaseFile } from "@/lib/appDownload";

/**
 * GET /api/app-download/android
 *
 * Sends the visitor to this deployment's Android app (ANDROID_APP_URL). An APK
 * on a GitHub release is sent from GitHub's file host rather than github.com,
 * which an installed GitHub app would otherwise open in its own browser,
 * without Chrome's download prompt (see ANDROID_DOWNLOAD_ROUTE). The target
 * only ever comes from the server's own configuration, never the request.
 * Unauthenticated, like /api/app-links: the app is public.
 */
export async function GET() {
  const { android } = readAppLinks(process.env);
  if (!android) {
    return NextResponse.json({ message: "No Android app is configured." }, { status: 404 });
  }
  let target = android;
  if (isGitHubReleaseFile(android)) {
    try {
      target = (await resolveReleaseFile(android, fetch)) ?? android;
    } catch {
      // GitHub unreachable or slow: the plain link still works in Chrome.
    }
  }
  const res = NextResponse.redirect(target, 302);
  // The file host's URL is signed and short-lived.
  res.headers.set("Cache-Control", "no-store");
  return res;
}
