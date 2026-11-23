import assert from "node:assert/strict";
import test from "node:test";
import {
    consumePasswordChangeLogoutTarget,
    consumePasswordChangeNotice,
    PASSWORD_CHANGE_LOGOUT_TARGET_KEY,
    PASSWORD_CHANGE_NOTICE_KEY,
    writePasswordChangeLogoutTarget,
    writePasswordChangeNotice,
} from "./password-change-notice.ts";
import type { AclSaveStatus } from "../app/api/user/model.ts";

class MemoryStorage {
    #values = new Map<string, string>();

    getItem(key: string): string | null {
        return this.#values.get(key) ?? null;
    }

    setItem(key: string, value: string): void {
        this.#values.set(key, value);
    }

    removeItem(key: string): void {
        this.#values.delete(key);
    }
}

test("writes each supported ACL save status to the one-time notice key", () => {
    const storage = new MemoryStorage();

    for (const status of ["saved", "failed", "unknown"] satisfies AclSaveStatus[]) {
        writePasswordChangeNotice(storage, status);
        assert.equal(storage.getItem(PASSWORD_CHANGE_NOTICE_KEY), status);
    }
});

test("consumes a supported notice once and removes it from storage", () => {
    const storage = new MemoryStorage();
    storage.setItem(PASSWORD_CHANGE_NOTICE_KEY, "saved");

    assert.equal(consumePasswordChangeNotice(storage), "saved");
    assert.equal(storage.getItem(PASSWORD_CHANGE_NOTICE_KEY), null);
    assert.equal(consumePasswordChangeNotice(storage), undefined);
});

test("returns undefined for a missing notice", () => {
    assert.equal(consumePasswordChangeNotice(new MemoryStorage()), undefined);
});

test("removes and rejects an unsupported notice", () => {
    const storage = new MemoryStorage();
    storage.setItem(PASSWORD_CHANGE_NOTICE_KEY, "invalid");

    assert.equal(consumePasswordChangeNotice(storage), undefined);
    assert.equal(storage.getItem(PASSWORD_CHANGE_NOTICE_KEY), null);
});

test("keeps the password reauthentication target for manual logout without allowing external redirects", () => {
    const storage = new MemoryStorage();
    const target = "/login?host=db.example.test&port=6380&username=alice&tls=true&signedOut=true";

    writePasswordChangeLogoutTarget(storage, target);
    assert.equal(storage.getItem(PASSWORD_CHANGE_LOGOUT_TARGET_KEY), target);
    assert.equal(consumePasswordChangeLogoutTarget(storage, "https://browser.example.test"), target);
    assert.equal(consumePasswordChangeLogoutTarget(storage, "https://browser.example.test"), undefined);

    writePasswordChangeLogoutTarget(storage, "https://attacker.example.test/login?host=db.example.test");
    assert.equal(consumePasswordChangeLogoutTarget(storage, "https://browser.example.test"), undefined);
    writePasswordChangeLogoutTarget(storage, "/settings");
    assert.equal(consumePasswordChangeLogoutTarget(storage, "https://browser.example.test"), undefined);
    writePasswordChangeLogoutTarget(storage, "/login");
    assert.equal(consumePasswordChangeLogoutTarget(storage, "invalid origin"), undefined);
});
