/**
 * FalkorDB enterprise detection.
 *
 * Graph offloading lives in a separate enterprise module (registered as
 * `falkordbe`), which is also what adds `GRAPH.STUBS`. Its presence in
 * `MODULE LIST` is the enterprise flag, so the UI can gate offload features
 * without probing commands that don't exist on community deployments.
 */

export const ENTERPRISE_MODULE_NAME = "falkordbe";

export function isEnterpriseModuleList(modules: { name?: string }[]): boolean {
  return modules.some((module) => module.name?.toLowerCase() === ENTERPRISE_MODULE_NAME);
}

export type StubsResponse = {
  stubs: string[];
};
