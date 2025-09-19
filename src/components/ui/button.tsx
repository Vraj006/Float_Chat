import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-lg transition-all duration-300",
        outline: "border-2 border-slate-600 bg-slate-800/90 text-white hover:bg-slate-700 hover:border-slate-500 backdrop-blur-sm transition-all duration-300",
        secondary: "bg-slate-700 text-white hover:bg-slate-600 border border-slate-600 transition-all duration-300",
        ghost: "hover:bg-slate-800 hover:text-white text-slate-300 transition-all duration-300",
        link: "text-blue-400 underline-offset-4 hover:underline hover:text-blue-300",
        professional: "bg-slate-800/90 border border-slate-600 text-white hover:bg-slate-700 hover:border-slate-500 transition-all duration-300 backdrop-blur-md shadow-lg",
        hero: "bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600 shadow-xl hover:shadow-2xl transition-all duration-300 font-bold",
        premium: "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold",
        subtle: "bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 hover:border-slate-600 transition-all duration-300",
        modern: "bg-slate-900/90 text-white border border-slate-600 hover:bg-slate-800 hover:border-slate-500 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
