import type { AclSaveStatus } from "../app/api/user/model.ts";

export const PASSWORD_CHANGE_NOTICE_KEY = "passwordChangeNotice";

export function writePasswordChangeNotice(storage: Pick<Storage, "setItem">, status: AclSaveStatus): void {
    storage.setItem(PASSWORD_CHANGE_NOTICE_KEY, status);
}

export function consumePasswordChangeNotice(storage: Pick<Storage, "getItem" | "removeItem">): AclSaveStatus | undefined {
    const status = storage.getItem(PASSWORD_CHANGE_NOTICE_KEY);
    storage.removeItem(PASSWORD_CHANGE_NOTICE_KEY);

    switch (status) {
        case "saved":
        case "failed":
        case "unknown":
            return status;
        default:
            return undefined;
    }
}
