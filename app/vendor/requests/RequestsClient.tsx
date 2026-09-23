'use client'

import { useState } from "react"
import { Users, CheckCircle, XCircle, MapPin } from "lucide-react"
import { Instagram, Youtube } from "@/components/common/SocialIcons"
import { CreatorProductRequest } from "@/types"
import { Button } from "@/components/ui/button"
import { RequestStatusBadge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { EmptyState } from "@/components/common/EmptyState"
import { useToast } from "@/components/ui/toast"
import { createClient } from "@/lib/supabase/client"
import { formatDate, formatNumber, generateReferralCode } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface RequestsClientProps {
  requests: CreatorProductRequest[]
  vendorId: string
}

const STATUS_TABS = ["all", "pending", "approved", "rejected", "completed"]

export function RequestsClient({ requests, vendorId }: RequestsClientProps) {
  const [tab, setTab] = useState("pending")
  const [selected, setSelected] = useState<CreatorProductRequest | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const filtered = tab === "all" ? requests : requests.filter(r => r.status === tab)

  const handleApprove = async (req: CreatorProductRequest) => {
    setActionLoading(true)
    try {
      // Update request status
      const { error } = await supabase
        .from("creator_product_requests")
        .update({ status: "approved", updated_at: new Date().toISOString() })
        .eq("id", req.id)

      if (error) { toast("error", "Failed to approve", error.message); return }

      // Generate referral link
      const code = generateReferralCode()
      await supabase.from("referral_links").insert({
        code,
        creator_id: req.creator_id,
        product_id: req.product_id,
        request_id: req.id,
        is_active: true,
      })

      // Send notification to creator
      await supabase.from("notifications").insert({
        user_id: req.creator_id,
        type: "request_approved",
        title: "Sample Request Approved! 🎉",
        message: `Your request for ${req.product?.name} has been approved. Your referral link is ready.`,
        data: { request_id: req.id, product_id: req.product_id },
      })

      toast("success", "Request approved!", "Referral link auto-generated for creator.")
      setSelected(null)
      router.refresh()
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (req: CreatorProductRequest) => {
    setActionLoading(true)
    try {
      await supabase
        .from("creator_product_requests")
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("id", req.id)

      await supabase.from("notifications").insert({
        user_id: req.creator_id,
        type: "request_rejected",
        title: "Sample Request Update",
        message: `Your request for ${req.product?.name} was not approved at this time.`,
        data: { request_id: req.id },
      })

      toast("info", "Request rejected")
      setSelected(null)
      router.refresh()
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Creator Requests</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review and manage collaboration requests from creators</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {STATUS_TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
            <span className="ml-1.5 text-gray-400">
              ({(t === "all" ? requests : requests.filter(r => r.status === t)).length})
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No requests" description={`No ${tab === "all" ? "" : tab} requests yet.`} />
      ) : (
        <div className="space-y-3">
          {filtered.map(req => (
            <div key={req.id} className="card-base p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Creator avatar */}
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-700 font-bold text-sm">
                {(req.creator?.name ?? "C")[0].toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">{req.creator?.name ?? "Creator"}</span>
                  <RequestStatusBadge status={req.status} />
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  For: <span className="font-medium text-gray-700">{req.product?.name}</span>
                </p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {req.creator?.niche && <span className="text-xs text-gray-400">{req.creator.niche}</span>}
                  {req.creator?.followers_count && (
                    <span className="text-xs text-gray-400">{formatNumber(req.creator.followers_count)} followers</span>
                  )}
                  {req.creator?.city && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin size={10} />{req.creator.city}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{formatDate(req.created_at)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => setSelected(req)}>
                  View
                </Button>
                {req.status === "pending" && (
                  <>
                    <Button size="sm" variant="success" onClick={() => handleApprove(req)} loading={actionLoading}>
                      <CheckCircle size={14} />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(req)} loading={actionLoading}>
                      <XCircle size={14} />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <Modal
          open={!!selected}
          onClose={() => setSelected(null)}
          title="Creator Request Details"
          size="lg"
        >
          <div className="space-y-4">
            {/* Creator info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                  {(selected.creator?.name ?? "C")[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{selected.creator?.name}</p>
                  <p className="text-xs text-gray-500">{selected.creator?.college}</p>
                  <p className="text-xs text-gray-500">{selected.creator?.city}</p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {selected.creator?.instagram && (
                      <span className="text-xs text-pink-600 flex items-center gap-1">
                        <Instagram size={12} />@{selected.creator.instagram}
                      </span>
                    )}
                    {selected.creator?.youtube && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <Youtube size={12} />{selected.creator.youtube}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {formatNumber(selected.creator?.followers_count ?? 0)} followers
                    </span>
                    <span className="text-xs text-gray-500">
                      {selected.creator?.engagement_rate}% engagement
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Request details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Sample Type</p>
                <p className="font-medium capitalize text-gray-900">{selected.sample_type}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Content Type</p>
                <p className="font-medium capitalize text-gray-900">{selected.content_type}</p>
              </div>
            </div>

            {selected.message && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1.5">Creator's Message</p>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 leading-relaxed">{selected.message}</p>
              </div>
            )}

            {/* Actions */}
            {selected.status === "pending" && (
              <div className="flex gap-3 pt-2">
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleReject(selected)}
                  loading={actionLoading}
                >
                  Reject
                </Button>
                <Button
                  variant="success"
                  className="flex-1"
                  onClick={() => handleApprove(selected)}
                  loading={actionLoading}
                >
                  Approve & Generate Link
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
