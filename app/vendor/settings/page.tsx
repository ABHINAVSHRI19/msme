import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { redirect } from "next/navigation"
import { SettingsClient } from "@/components/common/SettingsClient"

export const metadata = { title: "Settings — MicroMatch Vendor" }

export default async function VendorSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role, full_name, city").eq("id", user.id).single()
  if (profile?.role !== "vendor") redirect("/creator")

  const { data: vendor } = await supabase.from("vendors").select("business_name").eq("id", user.id).single()

  return (
    <DashboardLayout role="vendor" userName={vendor?.business_name ?? profile?.full_name} userEmail={user.email}>
      <SettingsClient
        user={{ id: user.id, email: user.email }}
        profile={{ full_name: profile?.full_name ?? "", city: profile?.city }}
        role="vendor"
      />
    </DashboardLayout>
  )
}
