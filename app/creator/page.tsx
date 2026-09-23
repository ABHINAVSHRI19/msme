import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { CreatorDashboardClient } from "./CreatorDashboardClient"
import { redirect } from "next/navigation"

export const metadata = { title: "Creator Dashboard — MicroMatch" }

export default async function CreatorDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>
}) {
  const { demo } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (demo === "true") {
    const demoChartData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i))
      return {
        date: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        clicks: Math.floor(Math.random() * 50 + 20),
        orders: Math.floor(Math.random() * 8 + 1),
        commission: Math.floor(Math.random() * 800 + 200),
      }
    })
    return (
      <DashboardLayout role="creator" userName="Demo Creator">
        <CreatorDashboardClient
          data={{
            stats: { totalClicks: 1248, totalOrders: 86, totalRevenue: 52400, totalCommission: 8760, pendingCommission: 2100, availableBalance: 4200, conversionRate: 69 },
            recentReferrals: [],
            chartData: demoChartData,
          }}
          isDemo
        />
      </DashboardLayout>
    )
  }

  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()
  if (profile?.role !== "creator") redirect("/vendor")

  const { data: creator } = await supabase.from("creators").select("name, city").eq("id", user.id).single()

  const [
    { data: referralLinks },
    { data: commissions },
    { data: clicks },
  ] = await Promise.all([
    supabase.from("referral_links").select("id, code, product:products(name, commission_percent)").eq("creator_id", user.id),
    supabase.from("commissions").select("commission_amount, status, created_at").eq("creator_id", user.id),
    supabase.from("referral_clicks").select("clicked_at").in(
      "referral_link_id",
      (await supabase.from("referral_links").select("id").eq("creator_id", user.id)).data?.map(l => l.id) ?? []
    ),
  ])

  const totalCommission = commissions?.reduce((s, c) => s + c.commission_amount, 0) ?? 0
  const pendingCommission = commissions?.filter(c => c.status === "pending").reduce((s, c) => s + c.commission_amount, 0) ?? 0
  const availableBalance = commissions?.filter(c => c.status === "available").reduce((s, c) => s + c.commission_amount, 0) ?? 0
  const paidCommission = commissions?.filter(c => c.status === "paid").reduce((s, c) => s + c.commission_amount, 0) ?? 0

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().slice(0, 10)
    const dayClicks = clicks?.filter(c => c.clicked_at.slice(0, 10) === dateStr).length ?? 0
    const dayCommissions = commissions?.filter(c => c.created_at.slice(0, 10) === dateStr) ?? []
    return {
      date: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      clicks: dayClicks,
      orders: dayCommissions.length,
      commission: dayCommissions.reduce((s, c) => s + c.commission_amount, 0),
    }
  })

  const linkIds = referralLinks?.map(l => l.id) ?? []
  const { data: orders } = await supabase
    .from("orders")
    .select("id, total")
    .in("referral_link_id", linkIds.length > 0 ? linkIds : ["none"])

  return (
    <DashboardLayout role="creator" userName={creator?.name ?? profile?.full_name} userEmail={user.email}>
      <CreatorDashboardClient
        data={{
          stats: {
            totalClicks: clicks?.length ?? 0,
            totalOrders: orders?.length ?? 0,
            totalRevenue: orders?.reduce((s, o) => s + o.total, 0) ?? 0,
            totalCommission,
            pendingCommission,
            availableBalance,
            conversionRate: clicks?.length ? Math.round((orders?.length ?? 0) / clicks.length * 100) : 0,
          },
          recentReferrals: (referralLinks ?? []).slice(0, 3).map((l: any) => ({
            id: l.id,
            code: l.code,
            product: Array.isArray(l.product) ? (l.product[0] ?? null) : (l.product ?? null),
          })),
          chartData,
        }}
        isDemo={false}
      />
    </DashboardLayout>
  )
}
