import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { redirect } from "next/navigation"
import { VendorOrdersClient } from "./VendorOrdersClient"

export const metadata = { title: "Orders — MicroMatch Vendor" }

export default async function VendorOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>
}) {
  const { demo } = await searchParams
  const isDemo = demo === "true"

  if (isDemo) {
    const mockOrders = Array.from({ length: 15 }).map((_, i) => ({
      id: `ORD-${1000 + i}`,
      total: Math.floor(Math.random() * 5000 + 1000),
      status: ["pending", "processing", "shipped", "delivered"][Math.floor(Math.random() * 4)],
      created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      creator_id: Math.random() > 0.3 ? "creator-1" : null,
      product: { name: "Wireless Earbuds", price: 2999 },
      creator: Math.random() > 0.3 ? { name: "Rahul Sharma", avatar_url: null } : null,
      vendor_id: "demo-vendor",
      customer_name: "Demo Customer",
      customer_email: "demo@customer.com",
      customer_phone: "9876543210",
      shipping_address: "123 Demo St, Demo City, 123456",
      updated_at: new Date().toISOString()
    }))

    return (
      <DashboardLayout role="vendor" userName="Demo Vendor">
        <VendorOrdersClient orders={mockOrders as any} />
      </DashboardLayout>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()
  if (profile?.role !== "vendor") redirect("/creator")

  const { data: vendor } = await supabase.from("vendors").select("business_name").eq("id", user.id).single()

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      product:products(name, price),
      creator:creators(name, avatar_url)
    `)
    .eq("vendor_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <DashboardLayout role="vendor" userName={vendor?.business_name ?? profile?.full_name} userEmail={user.email}>
      <VendorOrdersClient orders={orders ?? []} />
    </DashboardLayout>
  )
}
