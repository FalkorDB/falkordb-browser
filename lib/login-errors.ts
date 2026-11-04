export type LoginErrorCode =
  | "credentials_required"
  | "invalid_credentials"
  | "connection_failed";

export function classifyLoginError(error: unknown): LoginErrorCode {
  const message = error instanceof Error ? error.message : "";
  if (/^NOAUTH\b/i.test(message)) return "credentials_required";
  if (/^WRONGPASS\b/i.test(message)) return "invalid_credentials";
  return "connection_failed";
}

export class LoginError extends Error {
  readonly code: LoginErrorCode;

  constructor(code?: string) {
    const messages: Record<LoginErrorCode, string> = {
      credentials_required: "This database requires credentials. Please enter your username and password.",
      invalid_credentials: "Invalid credentials. Please check your username and password.",
      connection_failed: "Could not connect to the database. Please check your connection settings and server logs.",
    };
    const safeCode = code === "credentials_required" || code === "invalid_credentials"
      ? code
      : "connection_failed";
    super(messages[safeCode]);
    this.code = safeCode;
  }
}
