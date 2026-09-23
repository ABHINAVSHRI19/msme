import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { redirect } from "next/navigation"
import { VendorAnalyticsClient } from "./VendorAnalyticsClient"

export const metadata = { title: "Analytics — MicroMatch Vendor" }

export default async function VendorAnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()
  if (profile?.role !== "vendor") redirect("/creator")

  const { data: vendor } = await supabase.from("vendors").select("business_name").eq("id", user.id).single()

  // Get all orders with date for charting
  const { data: orders } = await supabase
    .from("orders")
    .select("id, total, status, created_at, creator_id")
    .eq("vendor_id", user.id)
    .order("created_at", { ascending: true })

  // Commissions paid
  const { data: commissions } = await supabase
    .from("commissions")
    .select("commission_amount, status, created_at")
    .eq("vendor_id", user.id)

  // Top creators by sales volume
  const { data: topCreators } = await supabase
    .from("orders")
    .select("creator_id, creator:creators(name, avatar_url, niche), total")
    .eq("vendor_id", user.id)
    .not("creator_id", "is", null)

  // Top products by order count
  const { data: topProducts } = await supabase
    .from("orders")
    .select("product_id, product:products(name, price), total")
    .eq("vendor_id", user.id)

  // Build 30-day chart data
  const chartData = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    const dateStr = d.toISOString().slice(0, 10)
    const dayOrders = orders?.filter(o => o.created_at.slice(0, 10) === dateStr) ?? []
    return {
      date: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      revenue: dayOrders.reduce((s, o) => s + o.total, 0),
      orders: dayOrders.length,
      referralRevenue: dayOrders.filter(o => o.creator_id).reduce((s, o) => s + o.total, 0),
    }
  })

  // Creator leaderboard aggregation
  const creatorMap = new Map<string, { name: string; avatar?: string; niche?: string; total: number; orders: number }>()
  topCreators?.forEach(o => {
    if (!o.creator_id) return
    const existing = creatorMap.get(o.creator_id) ?? {
      name: (o.creator as any)?.name ?? "Unknown",
      avatar: (o.creator as any)?.avatar_url,
      niche: (o.creator as any)?.niche,
      total: 0, orders: 0,
    }
    existing.total += o.total
    existing.orders += 1
    creatorMap.set(o.creator_id, existing)
  })
  const creatorLeaderboard = Array.from(creatorMap.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  // Product leaderboard
  const productMap = new Map<string, { name: string; price: number; total: number; orders: number }>()
  topProducts?.forEach(o => {
    if (!o.product_id) return
    const existing = productMap.get(o.product_id) ?? {
      name: (o.product as any)?.name ?? "Product",
      price: (o.product as any)?.price ?? 0,
      total: 0, orders: 0,
    }
    existing.total += o.total
    existing.orders += 1
    productMap.set(o.product_id, existing)
  })
  const productLeaderboard = Array.from(productMap.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  return (
    <DashboardLayout role="vendor" userName={vendor?.business_name ?? profile?.full_name} userEmail={user.email}>
      <VendorAnalyticsClient
        chartData={chartData}
        creatorLeaderboard={creatorLeaderboard}
        productLeaderboard={productLeaderboard}
        totalRevenue={orders?.reduce((s, o) => s + o.total, 0) ?? 0}
        totalCommissions={commissions?.reduce((s, c) => s + c.commission_amount, 0) ?? 0}
        totalOrders={orders?.length ?? 0}
        referralRate={orders?.length ? Math.round((orders.filter(o => o.creator_id).length / orders.length) * 100) : 0}
      />
    </DashboardLayout>
  )
}
