import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { redirect } from "next/navigation"
import { MessagesClient } from "./MessagesClient"

export const metadata = { title: "Messages — MicroMatch" }

export default async function VendorMessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()
  if (profile?.role !== "vendor") redirect("/creator")

  const { data: vendor } = await supabase.from("vendors").select("business_name").eq("id", user.id).single()

  const { data: conversations } = await supabase
    .from("conversations")
    .select(`
      *,
      creator:creators(id, name, avatar_url, niche),
      messages(id, content, created_at, sender_role, is_read)
    `)
    .eq("vendor_id", user.id)
    .order("last_message_at", { ascending: false })

  return (
    <DashboardLayout role="vendor" userName={vendor?.business_name ?? profile?.full_name} userEmail={user.email}>
      <MessagesClient conversations={conversations ?? []} userId={user.id} userRole="vendor" />
    </DashboardLayout>
  )
}
