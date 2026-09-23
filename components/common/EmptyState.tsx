import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center py-16 px-6",
      className
    )}>
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <Icon size={28} className="text-gray-400" />
        </div>
      )}
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-sm text-gray-500 mt-1.5 max-w-xs">{description}</p>}
      {action && (
        <div className="mt-5">
          {action.href ? (
            <a href={action.href}>
              <Button size="sm">{action.label}</Button>
            </a>
          ) : (
            <Button size="sm" onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      )}
    </div>
  )
}
