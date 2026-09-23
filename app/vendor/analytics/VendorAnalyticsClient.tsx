'use client'

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from "recharts"
import { TrendingUp, DollarSign, ShoppingBag, Users, Trophy } from "lucide-react"
import { ChartCard } from "@/components/cards/StatsCard"
import { formatCurrency } from "@/lib/utils"

interface VendorAnalyticsClientProps {
  chartData: { date: string; revenue: number; orders: number; referralRevenue: number }[]
  creatorLeaderboard: { id: string; name: string; avatar?: string; niche?: string; total: number; orders: number }[]
  productLeaderboard: { id: string; name: string; price: number; total: number; orders: number }[]
  totalRevenue: number
  totalCommissions: number
  totalOrders: number
  referralRate: number
}

export function VendorAnalyticsClient({
  chartData,
  creatorLeaderboard,
  productLeaderboard,
  totalRevenue,
  totalCommissions,
  totalOrders,
  referralRate,
}: VendorAnalyticsClientProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">30-day performance overview</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: DollarSign, color: "text-emerald-600 bg-emerald-50" },
          { label: "Total Orders", value: totalOrders, icon: ShoppingBag, color: "text-indigo-600 bg-indigo-50" },
          { label: "Commission Paid", value: formatCurrency(totalCommissions), icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
          { label: "Referral Rate", value: `${referralRate}%`, icon: Users, color: "text-blue-600 bg-blue-50" },
        ].map(s => (
          <div key={s.label} className="card-base p-4 flex items-center gap-3">
            <div className={`${s.color.split(" ")[1]} rounded-xl p-2.5 shrink-0`}>
              <s.icon size={18} className={s.color.split(" ")[0]} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue area chart */}
      <ChartCard title="Revenue (Last 30 Days)" subtitle="Total vs. referral-driven revenue">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="refGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} interval={4} />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: any) => [formatCurrency(Number(v) || 0)]} />
            <Legend />
            <Area type="monotone" dataKey="revenue" name="Total Revenue" stroke="#4f46e5" fill="url(#totalGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="referralRevenue" name="Referral Revenue" stroke="#10b981" fill="url(#refGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Orders bar chart */}
      <ChartCard title="Daily Orders (Last 30 Days)" subtitle="Order volume by day">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} interval={4} />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="orders" name="Orders" fill="#4f46e5" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Creators */}
        <div className="card-base p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-gray-900">Top Creators</h3>
          </div>
          {creatorLeaderboard.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">No creator sales yet</p>
          ) : (
            <div className="space-y-3">
              {creatorLeaderboard.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3">
                  <span className={`text-sm font-bold w-5 shrink-0 ${i === 0 ? "text-amber-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-700" : "text-gray-300"}`}>
                    {i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-xs font-bold text-indigo-600">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.orders} orders</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 shrink-0">{formatCurrency(c.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="card-base p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag size={16} className="text-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-900">Top Products</h3>
          </div>
          {productLeaderboard.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {productLeaderboard.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className={`text-sm font-bold w-5 shrink-0 ${i === 0 ? "text-amber-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-700" : "text-gray-300"}`}>
                    {i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <ShoppingBag size={14} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.orders} orders</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 shrink-0">{formatCurrency(p.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
