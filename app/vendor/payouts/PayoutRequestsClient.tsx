'use client'

import { useState } from "react"
import { CreditCard, CheckCircle, Clock, User2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/common/EmptyState"
import { formatCurrency, formatDate } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast"

interface PayoutRequest {
  id: string
  creator_id: string
  amount: number
  upi_id: string
  status: string
  requested_at: string
  processed_at?: string | null
  creator?: { id: string; name: string; avatar_url?: string; instagram?: string } | null
}

interface PayoutRequestsClientProps {
  payouts: PayoutRequest[]
  totalOwed: number
  vendorId: string
}

export function PayoutRequestsClient({ payouts, totalOwed, vendorId }: PayoutRequestsClientProps) {
  const [processing, setProcessing] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()

  const markPaid = async (payoutId: string, creatorId: string) => {
    setProcessing(payoutId)
    // Mark payout as paid
    await supabase.from("payouts").update({ status: "paid", processed_at: new Date().toISOString() }).eq("id", payoutId)
    // Mark creator's commissions as paid
    await supabase.from("commissions").update({ status: "paid" }).eq("creator_id", creatorId).in("status", ["available", "approved"])
    toast("success", "Payout marked as sent!")
    router.refresh()
    setProcessing(null)
  }

  const STATUS_VARIANT: Record<string, "success" | "warning" | "info" | "default"> = {
    pending: "warning",
    processing: "info",
    paid: "success",
    rejected: "default",
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Creator Payouts</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage commission payouts to your creators</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card-base p-4">
          <p className="text-xs text-gray-500 mb-1">Total Commission Owed</p>
          <p className="text-2xl font-bold text-amber-600">{formatCurrency(totalOwed)}</p>
        </div>
        <div className="card-base p-4">
          <p className="text-xs text-gray-500 mb-1">Pending Requests</p>
          <p className="text-2xl font-bold text-gray-900">{payouts.filter(p => p.status === "pending").length}</p>
        </div>
      </div>

      {payouts.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payout requests" description="Creators will request payouts here when their balance exceeds ₹200." />
      ) : (
        <div className="space-y-3">
          {payouts.map(p => (
            <div key={p.id} className="card-base p-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <User2 size={16} className="text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900">{p.creator?.name ?? "Creator"}</p>
                  <Badge variant={STATUS_VARIANT[p.status] ?? "default"} size="sm">{p.status}</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">UPI: {p.upi_id} · {formatDate(p.requested_at)}</p>
                {p.creator?.instagram && <p className="text-xs text-gray-400">{p.creator.instagram}</p>}
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-gray-900 text-base">{formatCurrency(p.amount)}</p>
                {p.status === "pending" && (
                  <Button
                    size="sm"
                    className="mt-2 gap-1"
                    onClick={() => markPaid(p.id, p.creator_id)}
                    loading={processing === p.id}
                  >
                    <CheckCircle size={13} />
                    Mark Paid
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-center text-gray-400">Payout system is mock — integrate real UPI/NEFT API for production.</p>
    </div>
  )
}
