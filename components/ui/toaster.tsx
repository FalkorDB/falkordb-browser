"use client"

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import ToastButton from "@/app/components/ToastButton";
import { copyText } from "@/lib/clipboard";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export const getQuerySettingsNavigationToast = (
  toast: any,
  navigateAndSaveCallback: () => void,
  navigateBack: () => void
) => {
  toast({
    title: "Query settings",
    description:
      "Are you sure you want to leave this page?\nYour changes will not be saved.",
    action: (
      <div className="flex flex-col gap-2">
        <ToastButton variant="Secondary" label="Leave" onClick={navigateBack} />
        <ToastButton
          variant="Primary"
          label="Leave & Save"
          onClick={navigateAndSaveCallback}
        />
      </div>
    ),
  });
};

function ToastItemDetails({ rawMessage }: { rawMessage: string }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const detailsId = useId();
  const copyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (copyResetRef.current) clearTimeout(copyResetRef.current);
  }, []);

  const handleCopy = async () => {
    const writer =
      typeof navigator !== "undefined"
        ? navigator.clipboard?.writeText?.bind(navigator.clipboard)
        : undefined;
    if (await copyText(writer, rawMessage)) {
      setCopied(true);
      if (copyResetRef.current) clearTimeout(copyResetRef.current);
      copyResetRef.current = setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mt-1">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="text-xs underline opacity-75 hover:opacity-100 cursor-pointer"
          onClick={() => setExpanded(prev => !prev)}
          aria-expanded={expanded}
          aria-controls={detailsId}
          aria-label={expanded ? "Hide raw error details" : "Show raw error details"}
          data-testid="toast-see-more"
        >
          {expanded ? "See less" : "See more"}
        </button>
        <button
          type="button"
          className="text-xs underline opacity-75 hover:opacity-100 cursor-pointer"
          onClick={() => { void handleCopy(); }}
          aria-label="Copy raw error message"
          data-testid="toast-copy-raw"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p
        id={detailsId}
        aria-live="polite"
        className={expanded ? "mt-1 text-xs opacity-75 break-all whitespace-pre-wrap" : "sr-only"}
        data-testid="toast-raw-message"
      >
        {expanded ? rawMessage : ""}
      </p>
    </div>
  );
}

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, rawMessage, hint, hintLink, ...props }) {
        return (
          <Toast data-testid={variant === "destructive" ? "toast-destructive" : "toast"} variant={variant} key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle data-testid="toast-title">{title}</ToastTitle>}
              {description && (
                <ToastDescription data-testid="toast-description">
                  {description}
                  {hint && (
                    <p className="mt-1 text-xs opacity-90" data-testid="toast-hint">
                      💡 {hint}
                    </p>
                  )}
                  {hintLink && (
                    hintLink.href.startsWith("/") ? (
                      <Link
                        href={hintLink.href}
                        onClick={() => dismiss(id)}
                        data-testid="toast-hint-link"
                        className="mt-1 inline-block text-xs underline text-primary hover:opacity-80"
                      >
                        {hintLink.label} →
                      </Link>
                    ) : (
                      <a
                        href={hintLink.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${hintLink.label} (opens in a new tab)`}
                        data-testid="toast-hint-link"
                        className="mt-1 inline-block text-xs underline text-primary hover:opacity-80"
                      >
                        {hintLink.label} →
                      </a>
                    )
                  )}
                  {rawMessage && <ToastItemDetails rawMessage={rawMessage} />}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
