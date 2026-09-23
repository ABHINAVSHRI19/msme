import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { redirect } from "next/navigation"
import { MessagesClient } from "@/app/vendor/messages/MessagesClient"

export const metadata = { title: "Messages — MicroMatch Creator" }

export default async function CreatorMessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()
  if (profile?.role !== "creator") redirect("/vendor")

  const { data: creator } = await supabase.from("creators").select("name").eq("id", user.id).single()

  const { data: conversations } = await supabase
    .from("conversations")
    .select(`
      *,
      vendor:vendors(id, business_name),
      messages(id, content, created_at, sender_role, is_read)
    `)
    .eq("creator_id", user.id)
    .order("last_message_at", { ascending: false })

  return (
    <DashboardLayout role="creator" userName={creator?.name ?? profile?.full_name} userEmail={user.email}>
      <MessagesClient conversations={conversations ?? []} userId={user.id} userRole="creator" />
    </DashboardLayout>
  )
}
