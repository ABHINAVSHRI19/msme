import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { redirect } from "next/navigation"
import { ReferralsClient } from "./ReferralsClient"

export const metadata = { title: "Referral Links — MicroMatch Creator" }

export default async function CreatorReferralsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()
  if (profile?.role !== "creator") redirect("/vendor")

  const { data: creator } = await supabase.from("creators").select("name").eq("id", user.id).single()

  const { data: links } = await supabase
    .from("referral_links")
    .select(`
      *,
      product:products(id, name, price, discount_price, commission_percent, category),
      clicks:referral_clicks(id, clicked_at),
      orders:orders(id, total, status)
    `)
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <DashboardLayout role="creator" userName={creator?.name ?? profile?.full_name} userEmail={user.email}>
      <ReferralsClient links={links ?? []} />
    </DashboardLayout>
  )
}
