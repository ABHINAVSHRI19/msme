import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { VendorDashboardClient } from "./VendorDashboardClient"
import { redirect } from "next/navigation"

export const metadata = { title: "Vendor Dashboard — MicroMatch" }

export default async function VendorDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>
}) {
  const { demo } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Demo mode bypass
  if (demo === "true") {
    const demoData = await getDemoVendorData(supabase)
    return (
      <DashboardLayout role="vendor" userName="Demo Vendor">
        <VendorDashboardClient data={demoData} isDemo />
      </DashboardLayout>
    )
  }

  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()
  if (profile?.role !== "vendor") redirect("/creator")

  const { data: vendor } = await supabase.from("vendors").select("*").eq("id", user.id).single()

  // Aggregate stats
  const [
    { count: productCount },
    { data: orders },
    { data: commissions },
    { data: requests },
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("vendor_id", user.id).neq("status", "deleted"),
    supabase.from("orders").select("total, creator_id, status, created_at").eq("vendor_id", user.id).not("creator_id", "is", null),
    supabase.from("commissions").select("commission_amount, status").eq("vendor_id", user.id),
    supabase.from("creator_product_requests").select("id, status").eq("vendor_id", user.id),
  ])

  const referralSales = orders?.filter(o => o.creator_id).reduce((s, o) => s + o.total, 0) ?? 0
  const commissionPaid = commissions?.filter(c => c.status === "paid").reduce((s, c) => s + c.commission_amount, 0) ?? 0
  const activeCreators = new Set(orders?.filter(o => o.creator_id).map(o => o.creator_id)).size
  const pendingRequests = requests?.filter(r => r.status === "pending").length ?? 0

  // Chart data (last 7 days)
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().slice(0, 10)
    const dayOrders = orders?.filter(o => o.created_at.slice(0, 10) === dateStr) ?? []
    return {
      date: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      revenue: dayOrders.reduce((s, o) => s + o.total, 0),
      orders: dayOrders.length,
    }
  })

  return (
    <DashboardLayout role="vendor" userName={vendor?.business_name ?? profile?.full_name} userEmail={user.email}>
      <VendorDashboardClient
        data={{
          stats: {
            productsListed: productCount ?? 0,
            activeCreators,
            referralSales,
            commissionPaid,
            shippingSaved: Math.round(referralSales * 0.08), // estimate
            conversionRate: orders?.length ? Math.round((orders.filter(o => o.status === "delivered").length / orders.length) * 100) : 0,
            totalRevenue: orders?.reduce((s, o) => s + o.total, 0) ?? 0,
          },
          pendingRequests,
          chartData,
          recentOrders: orders?.slice(-5) ?? [],
        }}
        isDemo={false}
      />
    </DashboardLayout>
  )
}

async function getDemoVendorData(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never) {
  const { data: orders } = await supabase
    .from("orders")
    .select("total, creator_id, status, created_at")
    .not("creator_id", "is", null)
    .limit(30)

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return {
      date: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      revenue: Math.floor(Math.random() * 5000 + 2000),
      orders: Math.floor(Math.random() * 8 + 2),
    }
  })

  return {
    stats: {
      productsListed: 24,
      activeCreators: 12,
      referralSales: 48200,
      commissionPaid: 7230,
      shippingSaved: 3800,
      conversionRate: 68,
      totalRevenue: 186400,
    },
    pendingRequests: 5,
    chartData,
    recentOrders: orders?.slice(0, 5) ?? [],
  }
}
