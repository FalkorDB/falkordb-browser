import type { Role } from "next-auth";

export const ADMIN_ONLY_MESSAGE = "Forbidden: only Admin users can manage users";

export type AdminRejection = {
  status: number;
  message: string;
};

/**
 * Decide whether the caller may change users: only Admin ACL users may.
 *
 * Returns the rejection to send, or `null` when the caller may proceed.
 */
export default function resolveAdminRejection(
  role: Role
): AdminRejection | null {
  if (role === "Admin") return null;

  return { status: 403, message: ADMIN_ONLY_MESSAGE };
}
