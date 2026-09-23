import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/layout/Navbar"
import { ProductDetailClient } from "./ProductDetailClient"
import { notFound } from "next/navigation"

interface ProductPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ ref?: string; creator?: string }>
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { id } = await params
  const { ref, creator } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let role: string | null = null
  if (user) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    role = data?.role ?? null
  }

  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      vendor:vendors(id, business_name, owner_name, city, description, logo_url, is_verified),
      images:product_images(id, url, is_primary, sort_order)
    `)
    .eq("id", id)
    .eq("status", "active")
    .single()

  if (!product) notFound()

  // Check if creator already has a referral link for this product
  let existingReferralLink: { id: string; code: string } | null = null
  if (user && role === "creator") {
    const { data: refLink } = await supabase
      .from("referral_links")
      .select("id, code")
      .eq("creator_id", user.id)
      .eq("product_id", id)
      .single()
    existingReferralLink = refLink
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} role={role} />
      <ProductDetailClient
        product={product}
        user={user}
        role={role}
        referralId={ref}
        existingReferralLink={existingReferralLink}
      />
    </div>
  )
}
