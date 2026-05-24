import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
  {
    variants: {
      variant: {
        default: "min-h-[48px] bg-[#7C5CFF] text-white hover:bg-[#6D4EFF] active:scale-[0.98] shadow-lg shadow-[#7C5CFF]/15",
        destructive:
          "min-h-[48px] bg-red-600 text-white hover:bg-red-500 active:scale-[0.98] shadow-lg shadow-red-600/15",
        outline:
          "min-h-[48px] border border-[#26272B] bg-transparent text-[#E4E4E7] hover:bg-[#151821] active:scale-[0.98] shadow-sm",
        secondary:
          "min-h-[48px] bg-[#0EA5E9] text-white hover:bg-[#38BDF8] active:scale-[0.98] shadow-lg shadow-sky-500/15",
        ghost: "min-h-[48px] hover:bg-accent hover:text-accent-foreground",
        link: "text-[#7C5CFF] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[48px] px-6",
        sm: "h-[38px] rounded-lg px-3",
        lg: "h-[54px] rounded-xl px-8 text-base",
        icon: "h-[48px] w-[48px] rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
