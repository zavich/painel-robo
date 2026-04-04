"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon, MinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-all duration-200 outline-none cursor-pointer",
        "hover:bg-gray-100 hover:scale-105 hover:shadow-sm",
        "dark:hover:bg-gray-800 dark:hover:scale-100 dark:hover:shadow-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "dark:focus-visible:ring-1 dark:focus-visible:ring-offset-0 dark:focus-visible:ring-gray-600",
        "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary",
        "dark:data-[state=checked]:bg-gray-700 dark:data-[state=checked]:border-gray-600 dark:data-[state=checked]:text-gray-300",
        "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground data-[state=indeterminate]:border-primary",
        "dark:data-[state=indeterminate]:bg-gray-700 dark:data-[state=indeterminate]:border-gray-600 dark:data-[state=indeterminate]:text-gray-300",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-gray-600 dark:bg-gray-800",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        {props.checked === "indeterminate" ? (
          <MinusIcon className="size-3.5" />
        ) : (
          <CheckIcon className="size-3.5" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
