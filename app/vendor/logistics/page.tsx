import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { LogisticsClient } from "./LogisticsClient"
import { redirect } from "next/navigation"
import { calculatePooledSavings, haversineDistance } from "@/lib/utils"

export const metadata = { title: "Pooled Logistics — MicroMatch" }

export default async function LogisticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()
  if (profile?.role !== "vendor") redirect("/creator")

  const { data: vendor } = await supabase.from("vendors").select("business_name, lat, lng, city").eq("id", user.id).single()

  // Fetch confirmed orders
  const { data: orders } = await supabase
    .from("orders")
    .select("id, city, pincode, delivery_address, total, customer_name, status, created_at, product:products(name)")
    .eq("vendor_id", user.id)
    .in("status", ["confirmed", "packed"])
    .order("created_at", { ascending: false })

  // Group by city
  const cityGroups: Record<string, typeof orders> = {}
  for (const order of orders ?? []) {
    const city = order.city ?? "Unknown"
    if (!cityGroups[city]) cityGroups[city] = []
    cityGroups[city]!.push(order)
  }

  const groups = Object.entries(cityGroups).map(([city, cityOrders]) => {
    const count = cityOrders?.length ?? 0
    const savings = calculatePooledSavings(count)
    return {
      city,
      orders: (cityOrders ?? []).map((o: any) => ({
        ...o,
        product: Array.isArray(o.product) ? (o.product[0] ?? null) : (o.product ?? null),
      })),
      ...savings,
    }
  })

  return (
    <DashboardLayout role="vendor" userName={vendor?.business_name ?? profile?.full_name} userEmail={user.email}>
      <LogisticsClient groups={groups} totalOrders={orders?.length ?? 0} />
    </DashboardLayout>
  )
}
