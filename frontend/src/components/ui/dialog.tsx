import * as DialogPrimitive from "@radix-ui/react-dialog";
import { IconX } from "@tabler/icons-react";
import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export const DialogPortal = DialogPrimitive.Portal;

export const DialogOverlay = ({ className, ...props }: ComponentProps<typeof DialogPrimitive.Overlay>) => {
  return (
    <DialogPrimitive.Overlay
      className={cn("fixed inset-0 z-50 bg-black/35 data-[state=closed]:animate-out data-[state=open]:animate-in", className)}
      {...props}
    />
  );
};

export const DialogContent = ({ children, className, ...props }: ComponentProps<typeof DialogPrimitive.Content>) => {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[min(520px,calc(100vw-48px))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-neutral-200 bg-white p-6 text-neutral-950 shadow-xl",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 grid size-8 place-items-center rounded-full border border-neutral-200 text-neutral-500 hover:bg-neutral-50">
          <IconX size={16} aria-hidden="true" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
};

export const DialogHeader = ({ className, ...props }: ComponentProps<"div">) => {
  return <div className={cn("grid gap-1.5 pr-8", className)} {...props} />;
};

export const DialogTitle = ({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) => {
  return <DialogPrimitive.Title className={cn("text-lg font-semibold", className)} {...props} />;
};

export const DialogDescription = ({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) => {
  return <DialogPrimitive.Description className={cn("text-sm text-neutral-500", className)} {...props} />;
};
