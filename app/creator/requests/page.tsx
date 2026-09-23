import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { redirect } from "next/navigation"
import { CreatorRequestsClient } from "./CreatorRequestsClient"

export const metadata = { title: "My Requests — MicroMatch Creator" }

export default async function CreatorRequestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()
  if (profile?.role !== "creator") redirect("/vendor")

  const { data: creator } = await supabase.from("creators").select("name").eq("id", user.id).single()

  const { data: requests } = await supabase
    .from("creator_product_requests")
    .select(`
      *,
      product:products(id, name, price, discount_price, commission_percent, category),
      vendor:vendors(business_name, city),
      referral_link:referral_links(id, code, is_active)
    `)
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <DashboardLayout role="creator" userName={creator?.name ?? profile?.full_name} userEmail={user.email}>
      <CreatorRequestsClient requests={requests ?? []} />
    </DashboardLayout>
  )
}
