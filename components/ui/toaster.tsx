"use client"

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
  saveCallback: () => void,
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
          onClick={() => {
            saveCallback();
            navigateBack();
          }}
        />
      </div>
    ),
  });
};

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast data-testid="toast" key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
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
