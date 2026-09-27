import { PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef } from "react";

const LONG_PRESS_MS = 500;
// A hold that wanders further than this is a pan, a drag or a scroll, not a long press.
const LONG_PRESS_MOVE_PX = 10;
// The browser still delivers a click when the finger comes off after a long press,
// and in multi-select that click would immediately toggle the element back off.
const CLICK_SUPPRESS_MS = 700;

interface LongPress {
    handlers: {
        onPointerDown: (e: ReactPointerEvent) => void;
        onPointerMove: (e: ReactPointerEvent) => void;
        onPointerUp: () => void;
        onPointerCancel: () => void;
    };
    /** True once for the click that follows a long press, so handlers can skip it. */
    consumeClick: () => boolean;
}

/**
 * Touch-only press and hold, the way a phone starts a multi-selection.
 *
 * @param onLongPress runs when the hold completes; return `false` to decline it,
 * leaving the following click alone (nothing was under the finger).
 */
export default function useLongPress(onLongPress?: () => boolean | void): LongPress {
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const origin = useRef<{ x: number, y: number } | undefined>(undefined);
    const suppressClick = useRef(false);
    const suppressClickTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => () => {
        clearTimeout(timer.current);
        clearTimeout(suppressClickTimer.current);
    }, []);

    const cancel = useCallback(() => {
        clearTimeout(timer.current);
        timer.current = undefined;
        origin.current = undefined;
    }, []);

    const onPointerDown = useCallback((e: ReactPointerEvent) => {
        // Mouse users have Ctrl-click, and a hold with the button down is a pan.
        if (!onLongPress || e.pointerType === "mouse") return;

        origin.current = { x: e.clientX, y: e.clientY };
        timer.current = setTimeout(() => {
            timer.current = undefined;

            if (onLongPress() === false) return;

            suppressClick.current = true;
            clearTimeout(suppressClickTimer.current);
            suppressClickTimer.current = setTimeout(() => {
                suppressClick.current = false;
            }, CLICK_SUPPRESS_MS);

            navigator.vibrate?.(10);
        }, LONG_PRESS_MS);
    }, [onLongPress]);

    const onPointerMove = useCallback((e: ReactPointerEvent) => {
        if (!origin.current) return;
        if (Math.hypot(e.clientX - origin.current.x, e.clientY - origin.current.y) < LONG_PRESS_MOVE_PX) return;
        cancel();
    }, [cancel]);

    const consumeClick = useCallback(() => {
        if (!suppressClick.current) return false;
        suppressClick.current = false;
        return true;
    }, []);

    return {
        handlers: {
            onPointerDown,
            onPointerMove,
            onPointerUp: cancel,
            onPointerCancel: cancel,
        },
        consumeClick,
    };
}
