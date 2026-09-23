import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { redirect } from "next/navigation"
import { EarningsClient } from "./EarningsClient"

export const metadata = { title: "Earnings — MicroMatch Creator" }

export default async function CreatorEarningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()
  if (profile?.role !== "creator") redirect("/vendor")

  const { data: creator } = await supabase.from("creators").select("name").eq("id", user.id).single()

  const { data: commissions } = await supabase
    .from("commissions")
    .select(`
      *,
      product:products(name, commission_percent),
      order:orders(id, total, customer_name, created_at)
    `)
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false })

  const totalCommission = commissions?.reduce((s, c) => s + c.commission_amount, 0) ?? 0
  const availableBalance = commissions?.filter(c => c.status === "available").reduce((s, c) => s + c.commission_amount, 0) ?? 0
  const pendingCommission = commissions?.filter(c => c.status === "pending" || c.status === "approved").reduce((s, c) => s + c.commission_amount, 0) ?? 0
  const paidOut = commissions?.filter(c => c.status === "paid").reduce((s, c) => s + c.commission_amount, 0) ?? 0

  return (
    <DashboardLayout role="creator" userName={creator?.name ?? profile?.full_name} userEmail={user.email}>
      <EarningsClient
        commissions={commissions ?? []}
        summary={{ totalCommission, availableBalance, pendingCommission, paidOut }}
      />
    </DashboardLayout>
  )
}
