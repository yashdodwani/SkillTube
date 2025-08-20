import React, { createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils'

const SelectContext = createContext()

export function Select({ children, ...props }) {
  const [value, setValue] = useState('')

  return (
    <SelectContext.Provider value={{ value, setValue }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ className, children, ...props }) {
  const { value } = useContext(SelectContext)

  return (
    <button
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
        className
      )}
      {...props}
    >
      {value || children}
    </button>
  )
}

export function SelectValue({ placeholder, ...props }) {
  return <span {...props}>{placeholder}</span>
}

export function SelectContent({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SelectItem({ value, children, className, ...props }) {
  const { setValue } = useContext(SelectContext)

  const handleSelect = () => {
    setValue(value)
  }

  return (
    <div
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent",
        className
      )}
      onClick={handleSelect}
      {...props}
    >
      {children}
    </div>
  )
}