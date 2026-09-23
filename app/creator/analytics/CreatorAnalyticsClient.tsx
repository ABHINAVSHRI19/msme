'use client'

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ComposedChart, Line
} from "recharts"
import { MousePointerClick, ShoppingBag, DollarSign, TrendingUp } from "lucide-react"
import { ChartCard } from "@/components/cards/StatsCard"
import { formatCurrency } from "@/lib/utils"

interface CreatorAnalyticsClientProps {
  chartData: { date: string; clicks: number; orders: number; commission: number }[]
  totalClicks: number
  totalOrders: number
  totalCommission: number
  conversionRate: number
}

export function CreatorAnalyticsClient({
  chartData,
  totalClicks,
  totalOrders,
  totalCommission,
  conversionRate,
}: CreatorAnalyticsClientProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your 30-day performance</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Clicks", value: totalClicks.toLocaleString("en-IN"), icon: MousePointerClick, color: "text-blue-600 bg-blue-50" },
          { label: "Orders Generated", value: totalOrders, icon: ShoppingBag, color: "text-indigo-600 bg-indigo-50" },
          { label: "Conversion Rate", value: `${conversionRate}%`, icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
          { label: "Total Earned", value: formatCurrency(totalCommission), icon: DollarSign, color: "text-emerald-600 bg-emerald-50" },
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

      {/* Clicks & Orders combined */}
      <ChartCard title="Clicks & Orders (Last 30 Days)" subtitle="Traffic and conversion trend">
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} interval={4} />
            <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#9ca3af" }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#9ca3af" }} />
            <Tooltip />
            <Area yAxisId="left" type="monotone" dataKey="clicks" name="Clicks" stroke="#4f46e5" fill="url(#clicksGrad)" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#10b981" strokeWidth={2.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Commission bar chart */}
      <ChartCard title="Daily Commission (Last 30 Days)" subtitle="Earnings from completed orders">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} interval={4} />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={v => `₹${v}`} />
            <Tooltip formatter={(v: any) => [formatCurrency(Number(v) || 0), "Commission"]} />
            <Bar dataKey="commission" name="Commission" fill="#10b981" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
