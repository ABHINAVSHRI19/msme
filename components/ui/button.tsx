import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "link" | "secondary" | "success"
  size?: "sm" | "md" | "lg" | "icon"
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", loading, children, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]"
    
    const variants = {
      default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
      outline: "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300",
      ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      link: "text-indigo-600 hover:text-indigo-700 underline-offset-4 hover:underline p-0 h-auto",
      secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
      success: "bg-emerald-600 text-white hover:bg-emerald-700",
    }
    
    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
      icon: "h-10 w-10 p-0",
    }
    
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
