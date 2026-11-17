import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { classifyLoginError, connectionResponseError, LoginError } from "./login-errors.ts";

describe("login errors", () => {
  it("distinguishes missing credentials, invalid credentials, and connection failures", () => {
    assert.equal(classifyLoginError(new Error("NOAUTH Authentication required.")), "credentials_required");
    assert.equal(classifyLoginError(new Error("WRONGPASS invalid username-password pair")), "invalid_credentials");
    assert.equal(classifyLoginError(new Error("connect ECONNREFUSED 127.0.0.1:6379")), "connection_failed");
    assert.equal(classifyLoginError(new Error("TLS certificate rejected")), "connection_failed");
    assert.equal(classifyLoginError(undefined), "connection_failed");
    assert.equal(classifyLoginError(new Error("Connection failed: NOAUTH Authentication required")), "credentials_required");
    assert.equal(classifyLoginError(new Error("Invalid password")), "invalid_credentials");
    assert.equal(classifyLoginError(new Error("ERR invalid password")), "invalid_credentials");
    for (const host of ["noauth.db", "wrongpass.db", "invalid password.db"]) {
      for (const failure of ["getaddrinfo ENOTFOUND", "connect ECONNREFUSED", "connect ETIMEDOUT"]) {
        assert.equal(classifyLoginError(new Error(`${failure} ${host}`)), "connection_failed");
        assert.equal(classifyLoginError(new Error(`${failure}: ${host}`)), "connection_failed");
      }
    }
  });

  it("only maps recognized add-connection codes to credential prompts", async (t) => {
    t.mock.method(console, "warn", () => {});
    for (const code of ["credentials_required", "invalid_credentials", "connection_failed"]) {
      const message = new LoginError(code).message;
      const error = await connectionResponseError(Response.json({ code, message }, { status: 400 }));
      assert.ok(error instanceof LoginError);
      assert.equal(error.code, code);
      assert.equal(error.message, message);
    }
    for (const response of [
      Response.json({ message: "Maximum connections reached" }, { status: 400 }),
      Response.json({ code: "UNKNOWN_ERROR" }, { status: 500 }),
      Response.json({ code: "__proto__" }, { status: 400 }),
      Response.json({ code: "toString" }, { status: 400 }),
      new Response("<html>Proxy error</html>", { status: 502 }),
      new Response(null, { status: 500 }),
    ]) {
      const error = await connectionResponseError(response);
      assert.equal(error instanceof LoginError, false);
      assert.match(error.message, /Failed to add connection/);
      assert.equal(error.message.includes("JSON"), false);
    }
  });

  it("only exposes predefined safe messages to the UI", () => {
    assert.equal(new LoginError("credentials_required").code, "credentials_required");
    assert.match(new LoginError("invalid_credentials").message, /Invalid credentials/);
    const error = new LoginError("secret backend details");
    assert.equal(error.code, "connection_failed");
    assert.equal(error.message.includes("secret backend details"), false);
  });
});
