import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hasLdapServers, isEnterpriseModuleList } from "./enterprise.ts";

describe("isEnterpriseModuleList", () => {
  it("detects the enterprise module alongside the graph module", () => {
    assert.equal(isEnterpriseModuleList([{ name: "graph" }, { name: "falkordbe" }]), true);
  });

  it("returns false for a community module list", () => {
    assert.equal(isEnterpriseModuleList([{ name: "graph" }]), false);
  });

  it("matches the module name case-insensitively", () => {
    assert.equal(isEnterpriseModuleList([{ name: "FalkorDBE" }]), true);
  });

  it("returns false for an empty module list", () => {
    assert.equal(isEnterpriseModuleList([]), false);
  });

  it("ignores modules without a name", () => {
    assert.equal(isEnterpriseModuleList([{}, { name: "graph" }]), false);
  });
});

describe("hasLdapServers", () => {
  it("detects a configured LDAP server", () => {
    assert.equal(hasLdapServers({ "falkordbe.ldap_servers": "ldap://localhost:389" }), true);
  });

  it("returns false when the parameter is present but empty", () => {
    assert.equal(hasLdapServers({ "falkordbe.ldap_servers": "" }), false);
  });

  it("treats a whitespace-only value as unset", () => {
    assert.equal(hasLdapServers({ "falkordbe.ldap_servers": "   " }), false);
  });

  it("returns false when the parameter is missing (community)", () => {
    assert.equal(hasLdapServers({}), false);
  });

  it("matches the parameter name case-insensitively", () => {
    assert.equal(hasLdapServers({ "FalkorDBE.LDAP_Servers": "ldap://host" }), true);
  });

  it("handles an array value", () => {
    assert.equal(hasLdapServers({ "falkordbe.ldap_servers": ["ldap://host"] }), true);
    assert.equal(hasLdapServers({ "falkordbe.ldap_servers": [] }), false);
    assert.equal(hasLdapServers({ "falkordbe.ldap_servers": [""] }), false);
  });

  it("returns false for a null or undefined reply", () => {
    assert.equal(hasLdapServers(null), false);
    assert.equal(hasLdapServers(undefined), false);
  });
});
