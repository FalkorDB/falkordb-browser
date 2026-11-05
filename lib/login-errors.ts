const LOGIN_ERROR_MESSAGES = {
  credentials_required: "This database requires credentials. Please enter your username and password.",
  invalid_credentials: "Invalid credentials. Please check your username and password.",
  connection_failed: "Could not connect to the database. Please check your connection settings and server logs.",
} as const;

export type LoginErrorCode = keyof typeof LOGIN_ERROR_MESSAGES;

function isLoginErrorCode(code: unknown): code is LoginErrorCode {
  return typeof code === "string" && Object.hasOwn(LOGIN_ERROR_MESSAGES, code);
}

export function classifyLoginError(error: unknown): LoginErrorCode {
  const message = error instanceof Error ? error.message : "";
  if (/(?:^|: )NOAUTH(?:\s|$)/i.test(message)) return "credentials_required";
  if (/(?:^|: |^ERR )(?:WRONGPASS|invalid password)(?:\s|$)/i.test(message)) return "invalid_credentials";
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
    isLoginErrorCode(body.code)) {
    return new LoginError(body.code);
  }
  return new Error("Failed to add connection. Please retry or check the server logs.");
}

export class LoginError extends Error {
  readonly code: LoginErrorCode;

  constructor(code?: string) {
    const safeCode = isLoginErrorCode(code) ? code : "connection_failed";
    super(LOGIN_ERROR_MESSAGES[safeCode]);
    this.code = safeCode;
  }
}
