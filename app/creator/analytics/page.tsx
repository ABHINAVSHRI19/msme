import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { redirect } from "next/navigation"
import { CreatorAnalyticsClient } from "./CreatorAnalyticsClient"

export const metadata = { title: "Analytics — MicroMatch Creator" }

export default async function CreatorAnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()
  if (profile?.role !== "creator") redirect("/vendor")

  const { data: creator } = await supabase.from("creators").select("name").eq("id", user.id).single()

  // Referral clicks (last 30 days)
  const { data: clicks } = await supabase
    .from("referral_clicks")
    .select("clicked_at, order_id, referral_link:referral_links(product:products(name))")
    .in(
      "referral_link_id",
      (await supabase.from("referral_links").select("id").eq("creator_id", user.id)).data?.map(l => l.id) ?? []
    )
    .order("clicked_at", { ascending: true })

  // Orders
  const { data: orders } = await supabase
    .from("orders")
    .select("id, total, status, created_at, product:products(name)")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: true })

  // Commissions
  const { data: commissions } = await supabase
    .from("commissions")
    .select("commission_amount, status, created_at")
    .eq("creator_id", user.id)

  // 30-day chart data
  const chartData = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    const dateStr = d.toISOString().slice(0, 10)
    const dayClicks = clicks?.filter(c => c.clicked_at.slice(0, 10) === dateStr).length ?? 0
    const dayOrders = orders?.filter(o => o.created_at.slice(0, 10) === dateStr) ?? []
    const dayCommission = commissions?.filter(c => c.created_at.slice(0, 10) === dateStr)
      .reduce((s, c) => s + c.commission_amount, 0) ?? 0
    return {
      date: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      clicks: dayClicks,
      orders: dayOrders.length,
      commission: dayCommission,
    }
  })

  return (
    <DashboardLayout role="creator" userName={creator?.name ?? profile?.full_name} userEmail={user.email}>
      <CreatorAnalyticsClient
        chartData={chartData}
        totalClicks={clicks?.length ?? 0}
        totalOrders={orders?.length ?? 0}
        totalCommission={commissions?.reduce((s, c) => s + c.commission_amount, 0) ?? 0}
        conversionRate={
          (clicks?.length ?? 0) > 0
            ? Math.round(((orders?.length ?? 0) / (clicks?.length ?? 1)) * 100)
            : 0
        }
      />
    </DashboardLayout>
  )
}
