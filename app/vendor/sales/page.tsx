import { redirect } from "next/navigation"
// Sales is a view of orders — redirect to analytics for now
export default function VendorSalesPage() {
  redirect("/vendor/orders")
}
