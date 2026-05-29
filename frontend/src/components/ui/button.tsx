import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full border text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4",
  {
    variants: {
      variant: {
        default: "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800",
        outline: "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
        ghost: "border-transparent bg-transparent text-neutral-700 hover:bg-neutral-100",
      },
      size: {
        default: "px-4",
        sm: "h-8 px-3 text-xs",
        icon: "size-9 p-0",
        "icon-sm": "size-8 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button = ({ asChild = false, className, size, variant, ...props }: ButtonProps) => {
  const Component = asChild ? Slot : "button";

  return <Component className={cn(buttonVariants({ className, size, variant }))} {...props} />;
};

export { buttonVariants };
