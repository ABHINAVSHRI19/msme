'use client'

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { Package, Users, TrendingUp, DollarSign, Truck, AlertCircle, Percent } from "lucide-react"
import { StatsCard, ChartCard } from "@/components/cards/StatsCard"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface DashboardData {
  stats: {
    productsListed: number
    activeCreators: number
    referralSales: number
    commissionPaid: number
    shippingSaved: number
    conversionRate: number
    totalRevenue: number
  }
  pendingRequests: number
  chartData: { date: string; revenue: number; orders: number }[]
  recentOrders: Array<{ total: number; creator_id: string | null; status: string; created_at: string }>
}

interface VendorDashboardClientProps {
  data: DashboardData
  isDemo: boolean
}

export function VendorDashboardClient({ data, isDemo }: VendorDashboardClientProps) {
  const { stats, pendingRequests, chartData, recentOrders } = data

  return (
    <div className="space-y-6">
      {/* Demo banner */}
      {isDemo && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={18} className="text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-700">Demo Mode</p>
            <p className="text-xs text-amber-600">You're viewing a demo. <Link href="/register?role=vendor" className="underline font-medium">Create a real account</Link> to get started.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview of your sales and creator performance</p>
        </div>
        <Link href="/vendor/products/new">
          <Button size="sm" className="gap-2">
            <Package size={15} />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Pending requests alert */}
      {pendingRequests > 0 && (
        <Link href="/vendor/requests">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between hover:bg-indigo-100 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Users size={17} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-indigo-700">
                  {pendingRequests} Pending Creator Request{pendingRequests > 1 ? "s" : ""}
                </p>
                <p className="text-xs text-indigo-500">Review and approve creator collaboration requests</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="border-indigo-300 text-indigo-600 shrink-0">
              Review →
            </Button>
          </div>
        </Link>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Products Listed"
          value={stats.productsListed}
          icon={Package}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          action={<Link href="/vendor/products"><span className="text-xs text-indigo-600 hover:underline">Manage →</span></Link>}
        />
        <StatsCard
          title="Active Creators"
          value={stats.activeCreators}
          icon={Users}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatsCard
          title="Referral Sales"
          value={formatCurrency(stats.referralSales)}
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          subtitle="from creator referrals"
        />
        <StatsCard
          title="Commission Paid"
          value={formatCurrency(stats.commissionPaid)}
          icon={DollarSign}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatsCard
          title="Shipping Saved"
          value={formatCurrency(stats.shippingSaved)}
          subtitle="estimated via pooling"
          icon={Truck}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
        />
        <StatsCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          icon={Percent}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="Revenue (Last 7 Days)"
          subtitle="Total sales including referral orders"
        >
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={(v: any) => [`₹${v}`, "Revenue"]} />
              <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Orders (Last 7 Days)"
          subtitle="Number of orders placed per day"
        >
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#818cf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Manage Products", href: "/vendor/products", emoji: "📦" },
          { label: "Creator Requests", href: "/vendor/requests", emoji: "👥" },
          { label: "View Orders", href: "/vendor/orders", emoji: "🛒" },
          { label: "Pooled Logistics", href: "/vendor/logistics", emoji: "🚚" },
        ].map(link => (
          <Link key={link.href} href={link.href}>
            <div className="card-base card-hover p-4 text-center cursor-pointer">
              <span className="text-2xl">{link.emoji}</span>
              <p className="text-xs font-medium text-gray-700 mt-2">{link.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
