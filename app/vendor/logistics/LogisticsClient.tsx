'use client'

import { Truck, Package, TrendingDown, MapPin, Info } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { StatsCard } from "@/components/cards/StatsCard"
import { EmptyState } from "@/components/common/EmptyState"

interface OrderGroup {
  city: string
  orders: Array<{
    id: string
    customer_name: string
    delivery_address: string
    city: string
    pincode: string
    total: number
    status: string
    created_at: string
    product?: { name: string } | null
  }>
  individualCost: number
  pooledCost: number
  savings: number
  savingsPercent: number
}

interface LogisticsClientProps {
  groups: OrderGroup[]
  totalOrders: number
}

export function LogisticsClient({ groups, totalOrders }: LogisticsClientProps) {
  const totalIndividual = groups.reduce((s, g) => s + g.individualCost, 0)
  const totalPooled = groups.reduce((s, g) => s + g.pooledCost, 0)
  const totalSavings = groups.reduce((s, g) => s + g.savings, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pooled Logistics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Group nearby orders to estimate shipping savings</p>
      </div>

      {/* Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-700">Estimated Savings Only</p>
          <p className="text-xs text-blue-600 mt-0.5">
            These calculations are estimates based on typical logistics pricing. Actual savings depend on your carrier, route, and shipment weight.
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Orders to Ship"
          value={totalOrders}
          icon={Package}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatsCard
          title="Individual Shipping"
          value={formatCurrency(totalIndividual)}
          subtitle="if shipped separately"
          icon={Truck}
          iconColor="text-red-500"
          iconBg="bg-red-50"
        />
        <StatsCard
          title="Pooled Shipping"
          value={formatCurrency(totalPooled)}
          subtitle="estimated batched cost"
          icon={Truck}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatsCard
          title="Est. Savings"
          value={formatCurrency(totalSavings)}
          subtitle="by pooling orders"
          icon={TrendingDown}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
      </div>

      {/* Groups */}
      {groups.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No orders ready for pooling"
          description="Confirmed orders will appear here grouped by city for shipping optimization."
        />
      ) : (
        <div className="space-y-4">
          {groups.map(group => (
            <div key={group.city} className="card-base overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <MapPin size={17} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{group.city}</p>
                    <p className="text-xs text-gray-500">{group.orders.length} order{group.orders.length > 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Est. Savings</p>
                  <p className="font-bold text-emerald-600 text-lg">{formatCurrency(group.savings)}</p>
                  <p className="text-xs text-emerald-500">{group.savingsPercent}% reduction</p>
                </div>
              </div>

              {/* Visual pooling diagram */}
              <div className="px-5 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                  {/* Orders list */}
                  <div className="lg:col-span-2 space-y-2">
                    {group.orders.map((order, i) => (
                      <div key={order.id} className="flex items-center gap-3">
                        <div className="text-xs font-semibold text-gray-500 w-20 text-right shrink-0 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100">
                          Order {i + 1}
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-indigo-300" />
                        <div className="text-xs font-medium text-gray-600 truncate max-w-[200px]">
                          {order.customer_name} · {order.pincode}
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-20" />
                      <div className="flex-1 h-px bg-indigo-300" />
                      <div className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
                        ↳ Shared Pickup
                      </div>
                    </div>
                  </div>

                  {/* Cost comparison */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Individual ({group.orders.length}×)</span>
                      <span className="font-semibold text-red-500 line-through">{formatCurrency(group.individualCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Pooled</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(group.pooledCost)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between">
                      <span className="text-sm font-semibold text-gray-700">Savings</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(group.savings)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
