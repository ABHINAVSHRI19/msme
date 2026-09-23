import { redirect } from "next/navigation"
// Campaigns redirect to analytics for MVP
export default function VendorCampaignsPage() {
  redirect("/vendor/analytics")
}
