import * as React from "react"
import type { ChangeEvent, CompositionEvent } from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, onChange, ...props }: React.ComponentProps<"input">) {
  const [isComposing, setIsComposing] = React.useState(false)

  const handleChange = React.useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      // Only propagate change when not in IME composition mode
      if (!isComposing && onChange) {
        onChange(e)
      }
    },
    [isComposing, onChange]
  )

  const handleCompositionEnd = React.useCallback(
    (e: CompositionEvent<HTMLInputElement>) => {
      setIsComposing(false)
      // After composition ends, trigger onChange with the final composed value
      if (onChange) {
        const target = e.currentTarget as HTMLInputElement
        const event = Object.assign(
          Object.create(Object.getPrototypeOf(e)),
          {
            target,
            currentTarget: target,
            nativeEvent: e.nativeEvent,
            type: 'change',
          }
        )
        onChange(event as ChangeEvent<HTMLInputElement>)
      }
    },
    [onChange]
  )

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      onChange={handleChange}
      onCompositionStart={() => setIsComposing(true)}
      onCompositionEnd={handleCompositionEnd}
      {...props}
    />
  )
}

export { Input }
