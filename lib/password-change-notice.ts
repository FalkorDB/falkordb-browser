import type { AclSaveStatus } from "../app/api/user/model.ts";

export const PASSWORD_CHANGE_NOTICE_KEY = "passwordChangeNotice";
export const PASSWORD_CHANGE_LOGOUT_TARGET_KEY = "passwordChangeLogoutTarget";

export function getPasswordChangeSignOutTarget(
    responseUrl: string | null | undefined,
    callbackUrl: string,
    currentUrl: string,
): string | undefined {
    if (!responseUrl) return undefined;

    const response = new URL(responseUrl, currentUrl);
    const callback = new URL(callbackUrl, currentUrl);
    return response.pathname === callback.pathname && response.search === callback.search
        ? callbackUrl
        : undefined;
}

export function getPasswordChangePersistenceWarning(status: AclSaveStatus): string {
    return status === "saved"
        ? ""
        : "FalkorDB could not confirm whether the ACL changes were saved to disk; they may already be saved.";
}

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

export function writePasswordChangeLogoutTarget(storage: Pick<Storage, "setItem">, target: string): void {
    storage.setItem(PASSWORD_CHANGE_LOGOUT_TARGET_KEY, target);
}

export function getPasswordChangeLogoutTarget(
    storage: Pick<Storage, "getItem">,
    origin: string,
): string | undefined {
    const target = storage.getItem(PASSWORD_CHANGE_LOGOUT_TARGET_KEY);
    if (!target) return undefined;

    try {
        const base = new URL(origin);
        const url = new URL(target, base);
        if (url.origin !== base.origin || url.pathname !== "/login") return undefined;
        return `${url.pathname}${url.search}`;
    } catch {
        return undefined;
    }
}

export function consumePasswordChangeLogoutTarget(
    storage: Pick<Storage, "getItem" | "removeItem">,
    origin: string,
): string | undefined {
    const target = getPasswordChangeLogoutTarget(storage, origin);
    storage.removeItem(PASSWORD_CHANGE_LOGOUT_TARGET_KEY);
    return target;
}
