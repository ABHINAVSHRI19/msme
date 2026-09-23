import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ==========================================
// HAVERSINE DISTANCE
// ==========================================
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Earth radius in km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number) {
  return deg * (Math.PI / 180)
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m away`
  return `${km.toFixed(1)} km away`
}

// ==========================================
// CURRENCY
// ==========================================
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(n: number): string {
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

// ==========================================
// REFERRAL CODE
// ==========================================
export function generateReferralCode(length = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// ==========================================
// DATE FORMATTING
// ==========================================
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = (now - then) / 1000

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return formatDate(dateStr)
}

// ==========================================
// COMMISSION CALCULATION
// ==========================================
export function calculateCommission(price: number, quantity: number, commissionPercent: number): number {
  return Math.round((price * quantity * commissionPercent) / 100)
}

// ==========================================
// POOLED LOGISTICS CALCULATION
// ==========================================
export function calculatePooledSavings(orderCount: number): {
  individualCost: number
  pooledCost: number
  savings: number
  savingsPercent: number
} {
  const individualCost = orderCount * 100 // ₹100 per order base estimate
  const pooledCost = Math.max(70, 70 + (orderCount - 1) * 30) // ₹70 base + ₹30 per extra
  const savings = Math.max(0, individualCost - pooledCost)
  const savingsPercent = individualCost > 0 ? Math.round((savings / individualCost) * 100) : 0
  return { individualCost, pooledCost, savings, savingsPercent }
}

// ==========================================
// STATUS LABELS
// ==========================================
export const REQUEST_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  shipped: 'Shipped',
  delivered: 'Delivered',
  content_pending: 'Content Pending',
  completed: 'Completed',
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const COMMISSION_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  available: 'Available',
  paid: 'Paid',
  cancelled: 'Cancelled',
}

export const PRODUCT_CATEGORIES = [
  { value: 'fashion', label: 'Fashion' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'food', label: 'Food' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'home', label: 'Home' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'handmade', label: 'Handmade' },
  { value: 'services', label: 'Services' },
  { value: 'other', label: 'Other' },
] as const

export const NICHES = [
  'Fashion & Style',
  'Beauty & Skincare',
  'Food & Cooking',
  'Fitness & Health',
  'Tech & Gadgets',
  'Home & Decor',
  'Lifestyle',
  'Handmade & Crafts',
  'Travel',
  'Education',
  'Gaming',
  'Finance',
  'Entertainment',
  'Other',
]

export const VENDOR_CATEGORIES = [
  'Retail',
  'Food & Beverage',
  'Fashion & Apparel',
  'Beauty & Wellness',
  'Electronics',
  'Home & Furniture',
  'Handmade & Crafts',
  'Services',
  'Agriculture',
  'Other',
]

// ==========================================
// TRUNCATE TEXT
// ==========================================
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

// ==========================================
// GET REFERRAL COOKIE
// ==========================================
export function getReferralFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/micromatch_ref=([^;]+)/)
  return match ? match[1] : null
}

export function setReferralCookie(referralLinkId: string): void {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `micromatch_ref=${referralLinkId}; expires=${expires}; path=/; SameSite=Lax`
}
