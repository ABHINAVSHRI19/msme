import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  iconColor?: string
  iconBg?: string
  className?: string
  action?: React.ReactNode
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  iconColor = "text-indigo-600",
  iconBg = "bg-indigo-50",
  className,
  action,
}: StatsCardProps) {
  return (
    <div className={cn("card-base p-5", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", trend.value >= 0 ? "text-emerald-600" : "text-red-500")}>
              <span>{trend.value >= 0 ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-gray-400">{trend.label}</span>
            </div>
          )}
          {action && <div className="mt-2">{action}</div>}
        </div>
        <div className={cn("rounded-xl p-3 shrink-0 ml-3", iconBg)}>
          <Icon size={22} className={iconColor} />
        </div>
      </div>
    </div>
  )
}

interface ChartCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  headerRight?: React.ReactNode
}

export function ChartCard({ title, subtitle, children, className, headerRight }: ChartCardProps) {
  return (
    <div className={cn("card-base p-5", className)}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {headerRight}
      </div>
      {children}
    </div>
  )
}
