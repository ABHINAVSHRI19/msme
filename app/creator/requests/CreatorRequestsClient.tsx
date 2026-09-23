'use client'

import { Package, Copy, ExternalLink, Clock, CheckCircle, XCircle, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RequestStatusBadge, CategoryBadge } from "@/components/ui/badge"
import { EmptyState } from "@/components/common/EmptyState"
import { useToast } from "@/components/ui/toast"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"

interface CreatorRequest {
  id: string
  status: "pending" | "approved" | "rejected" | "completed"
  sample_type: string
  content_type: string
  message: string
  created_at: string
  product?: { id: string; name: string; price: number; discount_price?: number; commission_percent: number; category: string } | null
  vendor?: { business_name: string; city: string } | null
  referral_link?: { id: string; code: string; is_active: boolean } | null
}

interface CreatorRequestsClientProps {
  requests: CreatorRequest[]
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending: <Clock size={16} className="text-amber-500" />,
  approved: <CheckCircle size={16} className="text-emerald-500" />,
  rejected: <XCircle size={16} className="text-red-400" />,
  completed: <CheckCircle size={16} className="text-blue-500" />,
}

export function CreatorRequestsClient({ requests }: CreatorRequestsClientProps) {
  const { toast } = useToast()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ""

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(`${appUrl}/r/${code}`)
    toast("success", "Referral link copied!")
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Sample Requests</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track your collaboration requests to vendors</p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: "Pending", count: requests.filter(r => r.status === "pending").length, color: "text-amber-600 bg-amber-50" },
          { label: "Approved", count: requests.filter(r => r.status === "approved").length, color: "text-emerald-600 bg-emerald-50" },
          { label: "Total", count: requests.length, color: "text-indigo-600 bg-indigo-50" },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-xl p-3 border`}>
            <p className={`text-2xl font-bold ${s.color.split(" ")[0]}`}>{s.count}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No requests yet"
          description="Browse products and request samples to start collaborating"
          action={{ label: "Discover Products", href: "/creator/discover" }}
        />
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <div key={req.id} className="card-base p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{STATUS_ICON[req.status]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-gray-900">{req.product?.name}</span>
                    <CategoryBadge category={req.product?.category ?? "other"} />
                    <RequestStatusBadge status={req.status} />
                  </div>
                  <p className="text-xs text-gray-500">
                    {req.vendor?.business_name} · {req.vendor?.city}
                  </p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    <span>Sample: {req.sample_type}</span>
                    <span>Content: {req.content_type}</span>
                    <span>{formatDate(req.created_at)}</span>
                  </div>

                  {/* Approved — show referral link */}
                  {req.status === "approved" && req.referral_link && (
                    <div className="mt-3 flex gap-2">
                      <div className="flex-1 flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2">
                        <Link2 size={14} className="text-indigo-500 shrink-0" />
                        <code className="text-xs text-indigo-700 truncate">{appUrl}/r/{req.referral_link.code}</code>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => copyLink(req.referral_link!.code)}>
                        <Copy size={14} />
                      </Button>
                      <Link href={`/product/${req.product?.id}`} target="_blank">
                        <Button size="sm" variant="outline">
                          <ExternalLink size={14} />
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Rejected */}
                  {req.status === "rejected" && (
                    <div className="mt-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                      Request was not approved at this time. Try again or explore other products.
                    </div>
                  )}
                </div>

                {/* Commission rate */}
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-emerald-600">{req.product?.commission_percent}%</p>
                  <p className="text-xs text-gray-400">commission</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
