import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {/* `action` is pulled out so it isn't spread onto the DOM element. */}
      {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast
          key={id}
          {...props}
          className="flex items-center gap-3 rounded-2xl p-3 pr-10"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
            <AlertCircle size={18} />
          </div>
          <div className="grid gap-0.5">
            {title && <ToastTitle className="font-medium">{title}</ToastTitle>}
            {description && (
              <ToastDescription className="text-muted-foreground">
                {description}
              </ToastDescription>
            )}
          </div>
          <ToastClose />

        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
