import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

const badgeVariants = cva("inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-medium", {
  variants: {
    variant: {
      default: "border-neutral-200 bg-neutral-100 text-neutral-700",
      success: "border-blue-200 bg-blue-50 text-blue-700",
      warning: "border-amber-200 bg-amber-50 text-amber-700",
      critical: "border-red-200 bg-red-50 text-red-700",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

export const Badge = ({ className, variant, ...props }: BadgeProps) => {
  return <span className={cn(badgeVariants({ className, variant }))} {...props} />;
};

export { badgeVariants };
