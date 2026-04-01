import * as React from "react"
import type { ChangeEvent, CompositionEvent } from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, onChange, ...props }: React.ComponentProps<"textarea">) {
  const [isComposing, setIsComposing] = React.useState(false)

  const handleChange = React.useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      // Only propagate change when not in IME composition mode
      if (!isComposing && onChange) {
        onChange(e)
      }
    },
    [isComposing, onChange]
  )

  const handleCompositionEnd = React.useCallback(
    (e: CompositionEvent<HTMLTextAreaElement>) => {
      setIsComposing(false)
      // After composition ends, trigger onChange with the final composed value
      if (onChange) {
        const target = e.currentTarget as HTMLTextAreaElement
        const event = Object.assign(
          Object.create(Object.getPrototypeOf(e)),
          {
            target,
            currentTarget: target,
            nativeEvent: e.nativeEvent,
            type: 'change',
          }
        )
        onChange(event as ChangeEvent<HTMLTextAreaElement>)
      }
    },
    [onChange]
  )

  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      onChange={handleChange}
      onCompositionStart={() => setIsComposing(true)}
      onCompositionEnd={handleCompositionEnd}
      {...props}
    />
  )
}

export { Textarea }
