import { cn } from "@/lib/utils"
import { REQUEST_STATUS_LABELS, ORDER_STATUS_LABELS, COMMISSION_STATUS_LABELS } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "success" | "warning" | "error" | "info" | "gray"
  className?: string
  size?: "sm" | "md"
}

export function Badge({ children, variant = "default", className, size = "md" }: BadgeProps) {
  const variants = {
    default: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    error: "bg-red-50 text-red-700 border border-red-200",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
    gray: "bg-gray-100 text-gray-600 border border-gray-200",
  }

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
  }

  return (
    <span className={cn("inline-flex items-center font-medium rounded-full", variants[variant], sizes[size], className)}>
      {children}
    </span>
  )
}

// Status-specific badges
export function RequestStatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, BadgeProps["variant"]> = {
    pending: "warning",
    approved: "success",
    rejected: "error",
    shipped: "info",
    delivered: "info",
    content_pending: "warning",
    completed: "success",
  }
  return (
    <Badge variant={variantMap[status] ?? "gray"}>
      {REQUEST_STATUS_LABELS[status] ?? status}
    </Badge>
  )
}

export function OrderStatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, BadgeProps["variant"]> = {
    pending: "warning",
    confirmed: "info",
    packed: "info",
    shipped: "default",
    delivered: "success",
    cancelled: "error",
  }
  return (
    <Badge variant={variantMap[status] ?? "gray"}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </Badge>
  )
}

export function CommissionStatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, BadgeProps["variant"]> = {
    pending: "warning",
    approved: "info",
    available: "success",
    paid: "success",
    cancelled: "error",
  }
  return (
    <Badge variant={variantMap[status] ?? "gray"}>
      {COMMISSION_STATUS_LABELS[status] ?? status}
    </Badge>
  )
}

export function CommissionBadge({ percent }: { percent: number }) {
  return (
    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-semibold">
      {percent}% Commission
    </span>
  )
}

export function CategoryBadge({ category }: { category: string }) {
  const labels: Record<string, string> = {
    fashion: "Fashion",
    beauty: "Beauty",
    food: "Food",
    fitness: "Fitness",
    electronics: "Electronics",
    home: "Home",
    lifestyle: "Lifestyle",
    handmade: "Handmade",
    services: "Services",
    other: "Other",
  }
  return (
    <Badge variant="gray">{labels[category] ?? category}</Badge>
  )
}
