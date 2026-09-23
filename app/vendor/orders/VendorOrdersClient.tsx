'use client'

import { useState } from "react"
import { Package, TrendingUp, User2, Filter } from "lucide-react"
import { OrderStatusBadge } from "@/components/ui/badge"
import { EmptyState } from "@/components/common/EmptyState"
import { formatCurrency, formatDate } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast"

interface Order {
  id: string
  customer_name: string
  customer_phone: string
  delivery_address: string
  city: string
  quantity: number
  unit_price: number
  total: number
  status: string
  payment_status: string
  created_at: string
  product?: { name: string; price: number } | null
  creator?: { name: string; avatar_url?: string } | null
}

const STATUSES = ["all", "pending", "confirmed", "packed", "shipped", "delivered", "cancelled"]
const NEXT_STATUS: Record<string, string> = {
  pending: "confirmed",
  confirmed: "packed",
  packed: "shipped",
  shipped: "delivered",
}

export function VendorOrdersClient({ orders }: { orders: Order[] }) {
  const [tab, setTab] = useState("all")
  const [updating, setUpdating] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()

  const filtered = tab === "all" ? orders : orders.filter(o => o.status === tab)

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0)
  const referralOrders = orders.filter(o => o.creator).length

  const advance = async (orderId: string, currentStatus: string) => {
    const next = NEXT_STATUS[currentStatus]
    if (!next) return
    setUpdating(orderId)
    await supabase.from("orders").update({ status: next }).eq("id", orderId)
    toast("success", "Order updated", `Moved to ${next}`)
    router.refresh()
    setUpdating(null)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage and fulfil customer orders</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Orders", value: orders.length, icon: Package, color: "text-indigo-600 bg-indigo-50" },
          { label: "Revenue", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
          { label: "Via Creators", value: referralOrders, icon: User2, color: "text-purple-600 bg-purple-50" },
        ].map(s => (
          <div key={s.label} className="card-base p-4 flex items-center gap-3">
            <div className={`${s.color.split(" ")[1]} rounded-xl p-2.5`}>
              <s.icon size={18} className={s.color.split(" ")[0]} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              tab === s ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:text-gray-700"
            }`}
          >
            {s} {s !== "all" && <span className="ml-1 opacity-70">({orders.filter(o => o.status === s).length})</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Package} title="No orders" description="Orders will appear here once customers purchase via referral links or directly." />
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <div key={order.id} className="card-base p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">{order.customer_name}</p>
                    <OrderStatusBadge status={order.status} />
                    {order.creator && (
                      <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
                        via {order.creator.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{order.product?.name} × {order.quantity}</p>
                  <p className="text-xs text-gray-400">{order.delivery_address}, {order.city}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900">{formatCurrency(order.total)}</p>
                  <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                </div>
              </div>

              {NEXT_STATUS[order.status] && (
                <button
                  onClick={() => advance(order.id, order.status)}
                  disabled={updating === order.id}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                >
                  {updating === order.id ? "Updating…" : `Mark as ${NEXT_STATUS[order.status]} →`}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
