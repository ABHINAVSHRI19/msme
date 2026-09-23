import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { RequestsClient } from "./RequestsClient"
import { redirect } from "next/navigation"

export const metadata = { title: "Creator Requests — MicroMatch" }

export default async function VendorRequestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()
  if (profile?.role !== "vendor") redirect("/creator")

  const { data: vendor } = await supabase.from("vendors").select("business_name").eq("id", user.id).single()

  const { data: requests } = await supabase
    .from("creator_product_requests")
    .select(`
      *,
      creator:creators(id, name, city, instagram, youtube, followers_count, engagement_rate, niche, avatar_url, college),
      product:products(id, name, price, commission_percent),
      referral_link:referral_links(id, code)
    `)
    .eq("vendor_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <DashboardLayout role="vendor" userName={vendor?.business_name ?? profile?.full_name} userEmail={user.email}>
      <RequestsClient requests={requests ?? []} vendorId={user.id} />
    </DashboardLayout>
  )
}
