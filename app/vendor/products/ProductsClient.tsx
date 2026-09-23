'use client'

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Plus, Edit, Pause, Trash2, Package } from "lucide-react"
import { Product } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge, CategoryBadge, CommissionBadge } from "@/components/ui/badge"
import { EmptyState } from "@/components/common/EmptyState"
import { useToast } from "@/components/ui/toast"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface ProductsClientProps {
  products: Product[]
  vendorId: string
}

export function ProductsClient({ products, vendorId }: ProductsClientProps) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const handlePause = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active"
    const { error } = await supabase.from("products").update({ status: newStatus }).eq("id", id)
    if (error) { toast("error", "Update failed"); return }
    toast("success", newStatus === "active" ? "Product activated" : "Product paused")
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return
    setDeleting(id)
    await supabase.from("products").update({ status: "deleted" }).eq("id", id)
    toast("success", "Product deleted")
    router.refresh()
    setDeleting(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} product{products.length !== 1 ? "s" : ""} listed</p>
        </div>
        <Link href="/vendor/products/new">
          <Button className="gap-2"><Plus size={16} />Add Product</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Add your first product to start collaborating with creators"
          action={{ label: "Add Product", href: "/vendor/products/new" }}
        />
      ) : (
        <div className="space-y-3">
          {products.map(product => {
            const primaryImage = product.images?.find(i => i.is_primary) ?? product.images?.[0]
            return (
              <div key={product.id} className="card-base p-4 flex items-center gap-4">
                {/* Image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  {primaryImage ? (
                    <Image src={primaryImage.url} alt={product.name} width={64} height={64} className="object-cover w-full h-full" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-2xl">🛍️</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">{product.name}</span>
                    <Badge variant={product.status === "active" ? "success" : "warning"} size="sm">
                      {product.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <CategoryBadge category={product.category} />
                    <CommissionBadge percent={product.commission_percent} />
                    {product.sample_available && <Badge variant="info" size="sm">Sample</Badge>}
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    <span>{formatCurrency(product.discount_price ?? product.price)}</span>
                    <span>Stock: {product.stock}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <Link href={`/vendor/products/${product.id}/edit`}>
                    <Button size="icon" variant="outline">
                      <Edit size={14} />
                    </Button>
                  </Link>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handlePause(product.id, product.status)}
                  >
                    <Pause size={14} />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDelete(product.id)}
                    loading={deleting === product.id}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
