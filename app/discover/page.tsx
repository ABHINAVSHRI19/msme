import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/layout/Navbar"
import { DiscoverClient } from "./DiscoverClient"

export const metadata = {
  title: "Discover Products — MicroMatch",
  description: "Browse local products available for creator collaboration with affiliate commission.",
}

export default async function DiscoverPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let role: string | null = null
  if (user) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    role = data?.role ?? null
  }

  // Fetch products with images and vendor info
  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      vendor:vendors(id, business_name, city, logo_url),
      images:product_images(id, url, is_primary, sort_order)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(60)

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} role={role} />
      <DiscoverClient products={products ?? []} />
    </div>
  )
}
