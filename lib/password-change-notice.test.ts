import assert from "node:assert/strict";
import test from "node:test";
import { consumePasswordChangeNotice, PASSWORD_CHANGE_NOTICE_KEY, writePasswordChangeNotice } from "./password-change-notice.ts";
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
