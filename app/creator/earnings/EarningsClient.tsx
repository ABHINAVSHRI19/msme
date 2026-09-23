'use client'

import { useState } from "react"
import { DollarSign, CheckCircle, Clock, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/common/EmptyState"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface Commission {
  id: string
  commission_amount: number
  sale_amount: number
  commission_percent: number
  status: "pending" | "approved" | "available" | "paid"
  created_at: string
  product?: { name: string; commission_percent: number } | null
  order?: { id: string; total: number; customer_name: string; created_at: string } | null
}

interface EarningsClientProps {
  commissions: Commission[]
  summary: {
    totalCommission: number
    availableBalance: number
    pendingCommission: number
    paidOut: number
  }
}

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "info" | "default" }> = {
  approved: { label: "Approved", variant: "info" },
  available: { label: "Available", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  paid: { label: "Paid Out", variant: "default" },
}

export function EarningsClient({ commissions, summary }: EarningsClientProps) {
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [upiId, setUpiId] = useState("")
  const [payoutLoading, setPayoutLoading] = useState(false)
  const [tab, setTab] = useState("all")
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const filtered = tab === "all" ? commissions : commissions.filter(c => c.status === tab)

  const handleRequestPayout = async () => {
    if (!upiId.trim()) { toast("error", "Please enter your UPI ID"); return }
    if (summary.availableBalance < 200) {
      toast("warning", "Minimum payout is ₹200", `Your available balance is ${formatCurrency(summary.availableBalance)}`)
      return
    }
    setPayoutLoading(true)
    try {
      // Create payout request
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from("payout_requests").insert({
        creator_id: user.id,
        amount: summary.availableBalance,
        upi_id: upiId,
        status: "pending",
      })

      // Mark available commissions as paid
      await supabase
        .from("commissions")
        .update({ status: "paid" })
        .eq("creator_id", user.id)
        .eq("status", "available")

      toast("success", "Payout requested!", `₹${summary.availableBalance} will be sent to ${upiId} within 24 hours.`)
      setShowPayoutModal(false)
      router.refresh()
    } finally {
      setPayoutLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Earnings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your commission history and payout status</p>
        </div>
        <Button
          className="gap-2"
          onClick={() => setShowPayoutModal(true)}
          disabled={summary.availableBalance < 200}
        >
          <CreditCard size={16} />
          Request Payout
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Earned", value: summary.totalCommission, icon: DollarSign, color: "text-gray-700" },
          { label: "Available", value: summary.availableBalance, icon: CheckCircle, color: "text-emerald-600" },
          { label: "Pending", value: summary.pendingCommission, icon: Clock, color: "text-amber-600" },
          { label: "Paid Out", value: summary.paidOut, icon: CreditCard, color: "text-blue-600" },
        ].map(s => (
          <div key={s.label} className="card-base p-4">
            <s.icon size={18} className={`${s.color} mb-2`} />
            <p className="text-xl font-extrabold text-gray-900">{formatCurrency(s.value)}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Minimum balance hint */}
      {summary.availableBalance > 0 && summary.availableBalance < 200 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
          Minimum payout is ₹200. You need {formatCurrency(200 - summary.availableBalance)} more.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {["all", "pending", "approved", "available", "paid"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Commission rows */}
      {filtered.length === 0 ? (
        <EmptyState icon={DollarSign} title="No earnings yet" description="Start promoting products to earn commission." />
      ) : (
        <div className="space-y-2">
          {filtered.map(commission => (
            <div key={commission.id} className="card-base p-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <DollarSign size={17} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{commission.product?.name ?? "Product"}</p>
                <p className="text-xs text-gray-500">
                  {commission.commission_percent}% of {formatCurrency(commission.sale_amount)} • {formatDate(commission.created_at)}
                </p>
                {commission.order?.customer_name && (
                  <p className="text-xs text-gray-400 mt-0.5">Customer: {commission.order.customer_name}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-emerald-600 text-base">{formatCurrency(commission.commission_amount)}</p>
                <Badge variant={STATUS_CONFIG[commission.status]?.variant ?? "default"} size="sm">
                  {STATUS_CONFIG[commission.status]?.label ?? commission.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payout Modal */}
      <Modal
        open={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        title="Request Payout"
        description={`Available balance: ${formatCurrency(summary.availableBalance)}`}
      >
        <div className="space-y-4">
          <Input
            label="UPI ID"
            placeholder="yourname@upi"
            value={upiId}
            onChange={e => setUpiId(e.target.value)}
            hint="Payments are processed within 24 hours"
          />
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Payout Amount</span>
              <span className="font-bold text-gray-900">{formatCurrency(summary.availableBalance)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Processing Fee</span>
              <span className="text-gray-900">Free</span>
            </div>
          </div>
          <Button loading={payoutLoading} className="w-full" onClick={handleRequestPayout}>
            Confirm Payout Request
          </Button>
          <p className="text-xs text-center text-gray-400">Mock UPI payout — no real transaction in demo</p>
        </div>
      </Modal>
    </div>
  )
}
