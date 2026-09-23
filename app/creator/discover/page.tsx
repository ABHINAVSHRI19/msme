import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { redirect } from "next/navigation"
import { DiscoverClient } from "@/app/discover/DiscoverClient"
import { Suspense } from "react"
import { ProductCardSkeleton } from "@/components/ui/skeleton"

export const metadata = { title: "Discover Products — MicroMatch Creator" }

export default async function CreatorDiscoverPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()
  if (profile?.role !== "creator") redirect("/vendor")

  const { data: creator } = await supabase.from("creators").select("name").eq("id", user.id).single()

  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      vendor:vendors(id, business_name, city, logo_url),
      images:product_images(id, url, is_primary, sort_order)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(80)

  return (
    <DashboardLayout role="creator" userName={creator?.name ?? profile?.full_name} userEmail={user.email}>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Discover Products</h1>
        <p className="text-sm text-gray-500 mt-0.5">Find products to promote and earn commission</p>
      </div>
      <DiscoverClient products={products ?? []} />
    </DashboardLayout>
  )
}
