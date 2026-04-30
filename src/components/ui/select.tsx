import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const SelectContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  setPlaceholder: (val: string) => void
} | null>(null)

export function Select({ children, value, onValueChange }: any) {
  const [placeholder, setPlaceholder] = React.useState("")
  return (
    <SelectContext.Provider value={{ value, onValueChange, placeholder, setPlaceholder }}>
      <div className="relative w-full group">{children}</div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ className, children }: any) {
  return (
    <div
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus-within:ring-2 focus-within:ring-primary/50 transition-all pointer-events-none group-focus-within:border-primary/50",
        className
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </div>
  )
}

export function SelectValue({ placeholder: propPlaceholder }: { placeholder?: string }) {
  const context = React.useContext(SelectContext)
  React.useEffect(() => {
    if (propPlaceholder) context?.setPlaceholder(propPlaceholder)
  }, [propPlaceholder, context])

  return (
    <span className={cn("block truncate", !context?.value && "text-muted-foreground")}>
      {context?.value || propPlaceholder || context?.placeholder}
    </span>
  )
}

export function SelectContent({ children, className }: any) {
  const context = React.useContext(SelectContext)
  return (
    <select
      value={context?.value}
      onChange={(e) => context?.onValueChange?.(e.target.value)}
      className={cn("absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none z-10", className)}
    >
      <option value="" disabled>{context?.placeholder}</option>
      {children}
    </select>
  )
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <option value={value} className="bg-[#111113] text-white">{children}</option>
}
