import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { classifyLoginError, LoginError } from "./login-errors.ts";

describe("login errors", () => {
  it("distinguishes missing credentials, invalid credentials, and connection failures", () => {
    assert.equal(classifyLoginError(new Error("NOAUTH Authentication required.")), "credentials_required");
    assert.equal(classifyLoginError(new Error("WRONGPASS invalid username-password pair")), "invalid_credentials");
    assert.equal(classifyLoginError(new Error("connect ECONNREFUSED 127.0.0.1:6379")), "connection_failed");
    assert.equal(classifyLoginError(new Error("TLS certificate rejected")), "connection_failed");
    assert.equal(classifyLoginError(undefined), "connection_failed");
  });

  it("only exposes predefined safe messages to the UI", () => {
    assert.equal(new LoginError("credentials_required").code, "credentials_required");
    assert.match(new LoginError("invalid_credentials").message, /Invalid credentials/);
    const error = new LoginError("secret backend details");
    assert.equal(error.code, "connection_failed");
    assert.equal(error.message.includes("secret backend details"), false);
  });
});
