import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { ProductsClient } from "./ProductsClient"
import { redirect } from "next/navigation"

export const metadata = { title: "Products — MicroMatch Vendor" }

export default async function VendorProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()
  if (profile?.role !== "vendor") redirect("/creator")

  const { data: vendor } = await supabase.from("vendors").select("business_name").eq("id", user.id).single()

  const { data: products } = await supabase
    .from("products")
    .select(`*, images:product_images(id, url, is_primary, sort_order)`)
    .eq("vendor_id", user.id)
    .neq("status", "deleted")
    .order("created_at", { ascending: false })

  return (
    <DashboardLayout role="vendor" userName={vendor?.business_name ?? profile?.full_name} userEmail={user.email}>
      <ProductsClient products={products ?? []} vendorId={user.id} />
    </DashboardLayout>
  )
}
