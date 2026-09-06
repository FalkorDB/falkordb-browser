/**
 * URL search-param helpers.
 *
 * Kept free of React and Next imports so they can be unit-tested directly;
 * `./useUrlParams` re-exports them alongside the hooks that use them.
 */

/**
 * Update one or more URL search params via history.replaceState.
 * Pass `null` as a value to delete a param.
 */
export function setUrlParam(updates: Record<string, string | null>) {
  const params = new URLSearchParams(window.location.search);

  // Delete all managed keys first so re-adding preserves the caller's order
  Object.keys(updates).forEach(key => params.delete(key));

  // Re-add in the order provided by the caller
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== null && value !== "") {
      params.append(key, value);
    }
  });

  const search = params.toString();
  const newUrl = `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`;
  window.history.replaceState(null, "", newUrl);
}

/**
 * Build the full URL param record for the /graph route from current state.
 *
 * Nothing about the working context — graph, query, selection, viewport,
 * layout — is in the URL; it belongs to the active tab, which persists it and
 * rebuilds it on entry. The URL only has to name *which* tab, so a reload
 * lands where you left off.
 *
 * Add new graph-page params here — the sync effect in providers.tsx
 * calls this so you never need to update the effect itself.
 */
export function buildGraphUrlParams(state: {
  tab: string;
}): Record<string, string | null> {
  return {
    tab: state.tab || null,
  };
}

/**
 * Build the full URL param record for the /settings route.
 */
export function buildSettingsUrlParams(state: {
  tab: string;
}): Record<string, string | null> {
  return {
    tab: state.tab || null,
  };
}

/**
 * Registry mapping pathname → param builder.
 * When adding a new route with URL params:
 * 1. Add a `buildXxxUrlParams` function above
 * 2. Register it here
 * 3. Pass the matching state slice from providers.tsx
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const URL_PARAM_BUILDERS: Record<string, (state: any) => Record<string, string | null>> = {
  "/graph": buildGraphUrlParams,
  "/settings": buildSettingsUrlParams,
};

/**
 * Sync current state to URL for the given pathname.
 * No-op if the pathname has no registered builder.
 */
export function syncRouteUrlParams(pathname: string, state: Record<string, unknown>) {
  const builder = URL_PARAM_BUILDERS[pathname];
  if (!builder) return;
  setUrlParam(builder(state));
}
