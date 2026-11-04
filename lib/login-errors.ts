export type LoginErrorCode =
  | "credentials_required"
  | "invalid_credentials"
  | "connection_failed";

export function classifyLoginError(error: unknown): LoginErrorCode {
  const message = error instanceof Error ? error.message : "";
  if (/\bNOAUTH\b/i.test(message)) return "credentials_required";
  if (/\bWRONGPASS\b|\binvalid password\b/i.test(message)) return "invalid_credentials";
  return "connection_failed";
}

export async function connectionResponseError(response: Response): Promise<Error> {
  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    console.warn("Could not parse add-connection error response:", error);
    return new Error("Failed to add connection. Please retry or check the server logs.");
  }
  if (body && typeof body === "object" && "code" in body &&
    typeof body.code === "string" &&
    ["credentials_required", "invalid_credentials", "connection_failed"].includes(body.code)) {
    return new LoginError(body.code);
  }
  return new Error("Failed to add connection. Please retry or check the server logs.");
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
