'use client'

import { useState } from "react"
import { Link2, Copy, ExternalLink, MousePointerClick, ShoppingBag, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge, CategoryBadge } from "@/components/ui/badge"
import { EmptyState } from "@/components/common/EmptyState"
import { useToast } from "@/components/ui/toast"
import { formatCurrency, calculateCommission } from "@/lib/utils"
import Link from "next/link"

interface ReferralLink {
  id: string
  code: string
  is_active: boolean
  created_at: string
  product?: {
    id: string
    name: string
    price: number
    discount_price?: number
    commission_percent: number
    category: string
  } | null
  clicks?: { id: string; clicked_at: string }[]
  orders?: { id: string; total: number; status: string }[]
}

interface ReferralsClientProps {
  links: ReferralLink[]
}

export function ReferralsClient({ links }: ReferralsClientProps) {
  const { toast } = useToast()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ""

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(`${appUrl}/r/${code}`)
    toast("success", "Copied!", "Referral link copied to clipboard.")
  }

  const totalClicks = links.reduce((s, l) => s + (l.clicks?.length ?? 0), 0)
  const totalOrders = links.reduce((s, l) => s + (l.orders?.length ?? 0), 0)
  const totalEarned = links.reduce((s, l) => {
    const commission = l.product?.commission_percent ?? 0
    return s + (l.orders?.reduce((os, o) => os + (o.total * commission / 100), 0) ?? 0)
  }, 0)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Referral Links</h1>
        <p className="text-sm text-gray-500 mt-0.5">Share these links to earn commission on every sale</p>
      </div>

      {/* Summary */}
      {links.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card-base p-4 text-center">
            <MousePointerClick size={20} className="text-blue-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-gray-900">{totalClicks.toLocaleString("en-IN")}</p>
            <p className="text-xs text-gray-500">Total Clicks</p>
          </div>
          <div className="card-base p-4 text-center">
            <ShoppingBag size={20} className="text-indigo-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-gray-900">{totalOrders}</p>
            <p className="text-xs text-gray-500">Total Orders</p>
          </div>
          <div className="card-base p-4 text-center">
            <DollarSign size={20} className="text-emerald-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalEarned)}</p>
            <p className="text-xs text-gray-500">Total Earned</p>
          </div>
        </div>
      )}

      {/* Links list */}
      {links.length === 0 ? (
        <EmptyState
          icon={Link2}
          title="No referral links yet"
          description="Request samples from vendors to get approved and receive your referral links"
          action={{ label: "Discover Products", href: "/creator/discover" }}
        />
      ) : (
        <div className="space-y-3">
          {links.map(link => {
            const clicks = link.clicks?.length ?? 0
            const orders = link.orders?.length ?? 0
            const convRate = clicks > 0 ? Math.round((orders / clicks) * 100) : 0
            const effectivePrice = link.product?.discount_price ?? link.product?.price ?? 0
            const earnPerSale = calculateCommission(effectivePrice, 1, link.product?.commission_percent ?? 0)
            const totalEarned = (link.orders?.reduce((s, o) => s + o.total, 0) ?? 0) * (link.product?.commission_percent ?? 0) / 100

            return (
              <div key={link.id} className="card-base p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-sm font-semibold text-gray-900">{link.product?.name ?? "Product"}</h3>
                      <CategoryBadge category={link.product?.category ?? "other"} />
                      <Badge variant={link.is_active ? "success" : "warning"} size="sm">
                        {link.is_active ? "Active" : "Paused"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400">Commission: {link.product?.commission_percent}% · Earn {formatCurrency(earnPerSale)} per sale</p>
                  </div>
                  <span className="text-lg font-bold text-emerald-600 shrink-0">{formatCurrency(totalEarned)}</span>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Clicks", value: clicks.toLocaleString("en-IN"), icon: MousePointerClick, color: "text-blue-500" },
                    { label: "Orders", value: orders, icon: ShoppingBag, color: "text-indigo-500" },
                    { label: "Conversion", value: `${convRate}%`, icon: DollarSign, color: "text-emerald-500" },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                      <s.icon size={16} className={`${s.color} mx-auto mb-1`} />
                      <p className="text-sm font-bold text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Referral URL */}
                <div className="flex gap-2">
                  <code className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-indigo-700 truncate">
                    {appUrl}/r/{link.code}
                  </code>
                  <Button size="sm" variant="outline" onClick={() => copyLink(link.code)}>
                    <Copy size={14} />
                  </Button>
                  <Link href={`/product/${link.product?.id}`} target="_blank">
                    <Button size="sm" variant="outline">
                      <ExternalLink size={14} />
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
