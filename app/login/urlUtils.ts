// URL format: [prefix[s]://][username[:password]@]host[:port]
// prefix: falkor | falkors | redis | rediss (optional, only matters for TLS via 's' suffix)
// username: optional, requires @ after credentials block
// password: optional, requires : before it (after username position), requires @ after credentials block
// @ : if present, at least one of username or password must exist
// host: just the hostname (optional — defaults provided)
// port: optional, requires : before it (after host), must be digits

const PROTOCOL_REGEX = /^(falkor|falkors|redis|rediss):\/\//;

export interface ParsedUrl {
  protocol: string;
  username: string;
  password: string;
  host: string;
  port: string;
  tls: boolean;
}

export interface UrlValidation {
  /** Whether the overall format is valid (no warnings) */
  valid: boolean;
  /** Parsed parts (best-effort even if invalid) */
  parsed: ParsedUrl;
  /** Per-part status for coloring: "good" | "warn" | "neutral" */
  parts: {
    protocol: "good" | "warn" | "neutral";
    username: "good" | "warn" | "neutral";
    password: "good" | "warn" | "neutral";
    at: "good" | "warn" | "neutral";
    host: "good" | "warn" | "neutral";
    port: "good" | "warn" | "neutral";
  };
}

/**
 * Manually parse a URL string into its components.
 * Uses manual splitting (not just regex) so it can handle malformed URLs
 * and provide per-part feedback.
 */
export function parseUrlString(url: string): ParsedUrl {
  let rest = url.trim();

  // 1. Extract protocol
  let protocol = "";
  const protoMatch = rest.match(PROTOCOL_REGEX);
  if (protoMatch) {
    protocol = protoMatch[1];
    rest = rest.slice(protoMatch[0].length);
  }

  // 2. Split on first @ for credentials vs host+port
  // Passwords containing @ must be percent-encoded as %40 in the URL
  let credStr = "";
  let hostPortStr = rest;
  const atIndex = rest.indexOf("@");
  if (atIndex >= 0) {
    credStr = rest.slice(0, atIndex);
    hostPortStr = rest.slice(atIndex + 1);
  }

  // 3. Parse credentials: username[:password] and decode percent-encoded values
  let username = "";
  let password = "";
  if (atIndex >= 0) {
    const colonIndex = credStr.indexOf(":");
    if (colonIndex >= 0) {
      username = decodeURIComponent(credStr.slice(0, colonIndex));
      password = decodeURIComponent(credStr.slice(colonIndex + 1));
    } else {
      username = decodeURIComponent(credStr);
    }
  }

  // 4. Parse host[:port] — split on last colon, only if part after is all digits
  let host = hostPortStr;
  let port = "";
  const lastColon = hostPortStr.lastIndexOf(":");
  if (lastColon >= 0) {
    const portCandidate = hostPortStr.slice(lastColon + 1);
    host = hostPortStr.slice(0, lastColon);
    port = portCandidate;
    // If portCandidate is not all digits, keep it as part of host
    // (this handles the case of a missing @ where host:password looks ambiguous)
  }

  const tls = protocol === "falkors" || protocol === "rediss";

  return { protocol, username, password, host, port, tls };
}

/**
 * Validate a URL string and return per-part status for error coloring.
 * Rules:
 * - protocol: optional → "good" if present, "neutral" if absent (never "warn")
 * - @: if present → "good", if absent → "neutral"
 * - username: if typed → "good"; if @ present but no username AND no password → "warn"
 * - password: if typed → "good"; if : before @ but empty → "warn"
 * - host: if present → "good", if absent → "neutral" (default provided)
 * - port: if present → "good"; if : typed after host but no digits → "warn"
 */
export function validateUrl(url: string): UrlValidation {
  const trimmed = url.trim();
  const parsed = parseUrlString(trimmed);

  // Detect raw separators from the original string
  const hasAt = trimmed.includes("@");

  // Detect : in credentials part (between protocol and @)
  let hasCredColon = false;
  if (hasAt) {
    const protoMatch = trimmed.match(PROTOCOL_REGEX);
    const afterProto = protoMatch ? trimmed.slice(protoMatch[0].length) : trimmed;
    const credsPart = afterProto.slice(0, afterProto.indexOf("@"));
    hasCredColon = credsPart.includes(":");
  }

  // Detect : in host+port part 
  let hasPortColon = false;
  if (hasAt) {
    const afterAt = trimmed.slice(trimmed.indexOf("@") + 1);
    hasPortColon = afterAt.includes(":");
  } else {
    const protoMatch = trimmed.match(PROTOCOL_REGEX);
    const afterProto = protoMatch ? trimmed.slice(protoMatch[0].length) : trimmed;
    hasPortColon = afterProto.includes(":");
  }

  let valid = true;

  // Protocol: optional, never a warning
  const protocolStatus: "good" | "neutral" = parsed.protocol ? "good" : "neutral";

  // @ status
  const atStatus: "good" | "neutral" = hasAt ? "good" : "neutral";

  // Username
  let usernameStatus: "good" | "warn" | "neutral" = "neutral";
  if (hasAt) {
    if (parsed.username) {
      usernameStatus = "good";
    } else if (!parsed.username && !parsed.password) {
      // @ present but no username and no password
      usernameStatus = "warn";
      valid = false;
    }
    // username empty but password present → neutral (password-only auth like :pass@)
  }

  // Password
  let passwordStatus: "good" | "warn" | "neutral" = "neutral";
  if (hasAt && hasCredColon) {
    if (parsed.password) {
      passwordStatus = "good";
    } else {
      passwordStatus = "warn";
      valid = false;
    }
  } else if (hasAt && parsed.password) {
    // Has password somehow without colon — shouldn't happen, but mark good
    passwordStatus = "good";
  }

  // Host: optional (default provided)
  // If host contains ':', it means @ is missing (hostnames never have colons)
  // But the host itself is not the problem — the missing @ is, so keep host neutral
  const missingAt = !hasAt && parsed.host.includes(":");
  let hostStatus: "good" | "warn" | "neutral" = "neutral";
  if (missingAt) {
    // Host is present in the URL, just mixed with creds — mark it good
    hostStatus = "good";
    valid = false;
  } else if (parsed.host) {
    hostStatus = "good";
  }

  // Port
  let portStatus: "good" | "warn" | "neutral" = "neutral";
  if (hasPortColon) {
    if (parsed.port) {
      portStatus = "good";
    } else {
      portStatus = "warn";
      valid = false;
    }
  }

  // When @ is missing but host has colon, mark @, username, password as warn
  let finalAtStatus: "good" | "warn" | "neutral" = atStatus;
  if (missingAt) {
    finalAtStatus = "warn";
    usernameStatus = "warn";
    passwordStatus = "warn";
  }

  return {
    valid,
    parsed,
    parts: {
      protocol: protocolStatus,
      username: usernameStatus,
      password: passwordStatus,
      at: finalAtStatus,
      host: hostStatus,
      port: portStatus,
    },
  };
}

/** Regex-based URL match for parsing into state (strict match only) */
export function matchUrl(url: string) {
  // Passwords containing @ must be percent-encoded as %40
  const urlPattern = /^(?:(falkor|falkors|redis|rediss):\/\/)?(?:([^:@]*)(?::([^@]*))?@)?([^:/\s]*)(?::(\d+))?$/;
  return url.match(urlPattern);
}
