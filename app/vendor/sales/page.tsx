import { redirect } from "next/navigation"

export default async function VendorSalesPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>
}) {
  const { demo } = await searchParams
  
  if (demo === "true") {
    redirect("/vendor/orders?demo=true")
  }
  
  redirect("/vendor/orders")
}
