import { createAndroidDownloadHandler } from "@/lib/appDownload";

const handle = createAndroidDownloadHandler(fetch, Date.now);

/**
 * GET /api/app-download/android
 *
 * Sends the visitor to this deployment's Android app (ANDROID_APP_URL); an APK
 * on a GitHub release goes by way of GitHub's file host, past the GitHub app
 * (see ANDROID_DOWNLOAD_ROUTE and createAndroidDownloadHandler).
 * Unauthenticated, like /api/app-links: the app is public.
 */
export async function GET() {
  return handle(process.env);
}
