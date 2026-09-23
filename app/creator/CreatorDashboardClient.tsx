'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts"
import { MousePointerClick, ShoppingBag, DollarSign, TrendingUp, AlertCircle, Link2 } from "lucide-react"
import { StatsCard, ChartCard } from "@/components/cards/StatsCard"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface CreatorStats {
  totalClicks: number
  totalOrders: number
  totalRevenue: number
  totalCommission: number
  pendingCommission: number
  availableBalance: number
  conversionRate: number
}

interface CreatorDashboardClientProps {
  data: {
    stats: CreatorStats
    recentReferrals: Array<{ id: string; code: string; product?: { name: string; commission_percent: number } | null }>
    chartData: { date: string; clicks: number; orders: number; commission: number }[]
  }
  isDemo: boolean
}

export function CreatorDashboardClient({ data, isDemo }: CreatorDashboardClientProps) {
  const { stats, recentReferrals, chartData } = data

  return (
    <div className="space-y-6">
      {isDemo && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={18} className="text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-700">Demo Mode</p>
            <p className="text-xs text-amber-600">
              You're viewing a demo. <Link href="/register?role=creator" className="underline font-medium">Create a free account</Link> to start earning.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Creator Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your performance at a glance</p>
        </div>
        <Link href="/creator/discover">
          <Button size="sm" className="gap-2">
            <TrendingUp size={15} />
            Discover Products
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Clicks" value={stats.totalClicks.toLocaleString("en-IN")} icon={MousePointerClick} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Orders Generated" value={stats.totalOrders} icon={ShoppingBag} iconColor="text-indigo-600" iconBg="bg-indigo-50" />
        <StatsCard title="Conversion Rate" value={`${stats.conversionRate}%`} icon={TrendingUp} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatsCard title="Revenue Driven" value={formatCurrency(stats.totalRevenue)} icon={ShoppingBag} iconColor="text-blue-500" iconBg="bg-blue-50" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Total Commission" value={formatCurrency(stats.totalCommission)} icon={DollarSign} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatsCard title="Pending" value={formatCurrency(stats.pendingCommission)} subtitle="awaiting approval" icon={DollarSign} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatsCard
          title="Available Balance"
          value={formatCurrency(stats.availableBalance)}
          subtitle="ready to withdraw"
          icon={DollarSign}
          iconColor="text-emerald-700"
          iconBg="bg-emerald-50"
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Clicks (Last 7 Days)" subtitle="Traffic from your referral links">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <Tooltip />
              <Area type="monotone" dataKey="clicks" stroke="#4f46e5" fill="url(#clickGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Commission Earned (Last 7 Days)" subtitle="Daily commission from completed orders">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={(v: any) => [`₹${v}`, "Commission"]} />
              <Bar dataKey="commission" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Discover Products", href: "/creator/discover", emoji: "🔍" },
          { label: "My Requests", href: "/creator/requests", emoji: "📦" },
          { label: "Referral Links", href: "/creator/referrals", emoji: "🔗" },
          { label: "My Earnings", href: "/creator/earnings", emoji: "💰" },
        ].map(link => (
          <Link key={link.href} href={link.href}>
            <div className="card-base card-hover p-4 text-center cursor-pointer">
              <span className="text-2xl">{link.emoji}</span>
              <p className="text-xs font-medium text-gray-700 mt-2">{link.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent referral links */}
      {recentReferrals.length > 0 && (
        <div className="card-base p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Recent Referral Links</h3>
            <Link href="/creator/referrals">
              <span className="text-xs text-indigo-600 hover:underline">View all →</span>
            </Link>
          </div>
          <div className="space-y-2">
            {recentReferrals.map(link => (
              <div key={link.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Link2 size={15} className="text-indigo-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{link.product?.name ?? "Product"}</p>
                  <p className="text-xs text-gray-400">/r/{link.code}</p>
                </div>
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {link.product?.commission_percent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
