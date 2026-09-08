import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-bold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-brand hover:bg-brand-hover text-white border-0 rounded-sm",
        secondary:
          "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-sm",
        outline:
          "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-sm",
        ghost: "hover:bg-slate-100 text-slate-700 border-0 rounded-sm",
        destructive: "bg-red-600 hover:bg-red-700 text-white border-0 rounded-sm",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3.5 py-1.5",
        lg: "h-10 px-5 py-2.5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
