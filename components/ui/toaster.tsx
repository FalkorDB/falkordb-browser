"use client"

import { useState } from "react";
import ToastButton from "@/app/components/ToastButton";
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

  return (
    <div className="mt-1">
      <button
        type="button"
        className="text-xs underline opacity-75 hover:opacity-100 cursor-pointer"
        onClick={() => setExpanded(prev => !prev)}
        data-testid="toast-see-more"
      >
        {expanded ? "See less" : "See more"}
      </button>
      {expanded && (
        <p className="mt-1 text-xs opacity-75 break-all whitespace-pre-wrap" data-testid="toast-raw-message">
          {rawMessage}
        </p>
      )}
    </div>
  );
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, rawMessage, ...props }) {
        return (
          <Toast data-testid={variant === "destructive" ? "toast-destructive" : "toast"} variant={variant} key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle data-testid="toast-title">{title}</ToastTitle>}
              {description && (
                <ToastDescription data-testid="toast-description">
                  {description}
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
