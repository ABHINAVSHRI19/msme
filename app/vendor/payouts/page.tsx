import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { redirect } from "next/navigation"
import { PayoutRequestsClient } from "./PayoutRequestsClient"

export const metadata = { title: "Payouts — MicroMatch Vendor" }

export default async function VendorPayoutsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()
  if (profile?.role !== "vendor") redirect("/creator")

  const { data: vendor } = await supabase.from("vendors").select("business_name").eq("id", user.id).single()

  // Payout requests from creators whose products belong to this vendor
  const { data: payouts } = await supabase
    .from("payouts")
    .select(`
      *,
      creator:creators(id, name, avatar_url, instagram)
    `)
    .order("requested_at", { ascending: false })
    .limit(50)

  const { data: commissions } = await supabase
    .from("commissions")
    .select("commission_amount, status")
    .eq("vendor_id", user.id)

  const totalOwed = commissions?.filter(c => c.status === "available" || c.status === "approved")
    .reduce((s, c) => s + c.commission_amount, 0) ?? 0

  return (
    <DashboardLayout role="vendor" userName={vendor?.business_name ?? profile?.full_name} userEmail={user.email}>
      <PayoutRequestsClient payouts={payouts ?? []} totalOwed={totalOwed} vendorId={user.id} />
    </DashboardLayout>
  )
}
