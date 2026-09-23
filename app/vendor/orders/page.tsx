import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { redirect } from "next/navigation"
import { VendorOrdersClient } from "./VendorOrdersClient"

export const metadata = { title: "Orders — MicroMatch Vendor" }

export default async function VendorOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()
  if (profile?.role !== "vendor") redirect("/creator")

  const { data: vendor } = await supabase.from("vendors").select("business_name").eq("id", user.id).single()

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      product:products(name, price),
      creator:creators(name, avatar_url)
    `)
    .eq("vendor_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <DashboardLayout role="vendor" userName={vendor?.business_name ?? profile?.full_name} userEmail={user.email}>
      <VendorOrdersClient orders={orders ?? []} />
    </DashboardLayout>
  )
}
