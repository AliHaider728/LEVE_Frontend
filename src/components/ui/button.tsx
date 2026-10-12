import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring } from "motion/react";

const buttonVariants = cva(
  "group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-xs font-semibold uppercase tracking-widest cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "h-auto bg-transparent p-0 text-primary shadow-none hover:text-accent",
      },
      size: {
        default: "min-h-11 px-4 py-2",
        sm: "min-h-11 rounded-md px-3 text-xs",
        lg: "min-h-11 rounded-md px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  magnetic?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      magnetic = true,
      onMouseMove,
      onMouseLeave,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 260, damping: 18 });
    const springY = useSpring(y, { stiffness: 260, damping: 18 });
    const handleMove = (event: React.MouseEvent<HTMLButtonElement>) => {
      onMouseMove?.(event);
      if (!magnetic || window.matchMedia("(pointer: coarse)").matches) return;
      const rect = event.currentTarget.getBoundingClientRect();
      x.set((event.clientX - rect.left - rect.width / 2) * 0.12);
      y.set((event.clientY - rect.top - rect.height / 2) * 0.12);
    };
    const handleLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
      onMouseLeave?.(event);
      x.set(0);
      y.set(0);
    };
    return (
      <motion.div
        style={{ x: springX, y: springY }}
        className={cn("inline-flex", className?.split(/\s+/).includes("w-full") && "w-full", props.disabled && "pointer-events-none opacity-40")}
      >
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          {...props}
        />
      </motion.div>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
