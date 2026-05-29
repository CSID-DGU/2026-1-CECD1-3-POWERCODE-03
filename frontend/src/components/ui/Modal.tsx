import * as DialogPrimitive from "@radix-ui/react-dialog";
import { IconX } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  size?: ModalSize;
  children: ReactNode;
  trigger?: ReactNode;
  showCloseButton?: boolean;
}

export const Modal = ({
  isOpen,
  onOpenChange,
  title,
  description,
  size = "md",
  children,
  trigger,
  showCloseButton = true,
}: ModalProps) => {
  const sizeClasses = {
    sm: "w-[min(400px,calc(100vw-32px))]",
    md: "w-[min(520px,calc(100vw-48px))]",
    lg: "w-[min(720px,calc(100vw-64px))]",
    xl: "w-[min(920px,calc(100vw-64px))]",
    full: "w-[calc(100vw-32px)] max-w-7xl",
  }[size];

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      {trigger && (
        <DialogPrimitive.Trigger asChild>
          {trigger}
        </DialogPrimitive.Trigger>
      )}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/35 dialog-overlay"
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-neutral-200 bg-white p-6 text-neutral-950 shadow-xl dark:bg-[#121212] dark:border-[#2d2d2d] dark:text-white dialog-content",
            sizeClasses
          )}
        >
          <div className="grid gap-1.5 pr-8">
            <DialogPrimitive.Title className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description className="text-sm text-neutral-500 dark:text-neutral-400">
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
          
          <div className="mt-4">{children}</div>

          {showCloseButton && (
            <DialogPrimitive.Close className="absolute right-4 top-4 grid size-8 place-items-center rounded-full border border-neutral-200 text-neutral-500 hover:bg-neutral-50 dark:border-[#2d2d2d] dark:text-neutral-400 dark:hover:bg-[#1e1e1e] transition-colors">
              <IconX size={16} aria-hidden="true" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
