import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { ProductFormClient } from "../ProductFormClient"
import { redirect } from "next/navigation"

export const metadata = { title: "Add Product — MicroMatch" }

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()
  if (profile?.role !== "vendor") redirect("/creator")

  const { data: vendor } = await supabase.from("vendors").select("business_name, lat, lng").eq("id", user.id).single()

  return (
    <DashboardLayout role="vendor" userName={vendor?.business_name ?? profile?.full_name} userEmail={user.email}>
      <ProductFormClient vendorId={user.id} vendorLat={vendor?.lat} vendorLng={vendor?.lng} />
    </DashboardLayout>
  )
}
