import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-sm border transition-colors duration-150",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-600 border-slate-200",
        success: "bg-emerald-50 text-emerald-700 border-emerald-200",
        warning: "bg-amber-50 text-amber-800 border-amber-200",
        brand: "bg-orange-50 text-orange-700 border-orange-200",
        destructive: "bg-red-50 text-red-700 border-red-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
