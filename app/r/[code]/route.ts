import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { NextRequest } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const supabase = await createClient()
  const headerList = await headers()
  const userAgent = headerList.get("user-agent") ?? ""

  // Find referral link by code
  const { data: link, error } = await supabase
    .from("referral_links")
    .select("id, product_id, creator_id, is_active")
    .eq("code", code)
    .single()

  if (error || !link || !link.is_active) {
    redirect("/discover?ref_error=invalid")
  }

  // Log the click
  const device_type = /mobile|android|iphone|ipad/i.test(userAgent) ? "mobile" : "desktop"
  await supabase.from("referral_clicks").insert({
    referral_link_id: link.id,
    user_agent: userAgent.slice(0, 200),
    device_type,
    clicked_at: new Date().toISOString(),
  })

  // Build product URL with referral cookie param
  const productUrl = new URL(`/product/${link.product_id}`, process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
  productUrl.searchParams.set("ref", link.id)
  productUrl.searchParams.set("creator", link.creator_id)

  // Redirect to product with ref in URL (client will pick up and set cookie)
  redirect(productUrl.toString())
}
