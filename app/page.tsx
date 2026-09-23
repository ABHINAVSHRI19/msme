import { createClient } from "@/lib/supabase/server"
import { LandingPage } from "@/components/layout/LandingPage"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let role: string | null = null
  if (user) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    role = data?.role ?? null
  }

  return <LandingPage user={user} role={role} />
}
