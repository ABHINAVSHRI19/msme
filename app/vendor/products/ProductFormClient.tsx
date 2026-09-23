'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input, Textarea, SelectField } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { createClient } from "@/lib/supabase/client"
import { PRODUCT_CATEGORIES } from "@/lib/utils"

interface ProductFormClientProps {
  vendorId: string
  vendorLat?: number | null
  vendorLng?: number | null
  initialData?: {
    id: string
    name: string
    description: string
    category: string
    price: number
    discount_price?: number
    stock: number
    commission_percent: number
    sample_available: boolean
    barter_available: boolean
    creator_requirements?: string
    pickup_address?: string
    delivery_available: boolean
    tags: string[]
  }
}

export function ProductFormClient({ vendorId, vendorLat, vendorLng, initialData }: ProductFormClientProps) {
  const isEdit = !!initialData
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    category: initialData?.category ?? "other",
    price: initialData?.price?.toString() ?? "",
    discount_price: initialData?.discount_price?.toString() ?? "",
    stock: initialData?.stock?.toString() ?? "10",
    commission_percent: initialData?.commission_percent?.toString() ?? "15",
    sample_available: initialData?.sample_available ?? false,
    barter_available: initialData?.barter_available ?? false,
    creator_requirements: initialData?.creator_requirements ?? "",
    pickup_address: initialData?.pickup_address ?? "",
    delivery_available: initialData?.delivery_available ?? true,
    tags: initialData?.tags ?? [] as string[],
  })
  const [tagInput, setTagInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Product name is required"
    if (!form.price || isNaN(Number(form.price))) e.price = "Valid price is required"
    if (!form.commission_percent || isNaN(Number(form.commission_percent))) e.commission_percent = "Valid commission is required"
    if (Number(form.commission_percent) < 1 || Number(form.commission_percent) > 80) e.commission_percent = "Commission must be between 1-80%"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !form.tags.includes(tag)) {
      setForm(f => ({ ...f, tags: [...f.tags, tag] }))
    }
    setTagInput("")
  }

  const removeTag = (tag: string) => {
    setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const payload = {
        vendor_id: vendorId,
        name: form.name,
        description: form.description || null,
        category: form.category,
        price: Number(form.price),
        discount_price: form.discount_price ? Number(form.discount_price) : null,
        stock: Number(form.stock),
        commission_percent: Number(form.commission_percent),
        sample_available: form.sample_available,
        barter_available: form.barter_available,
        creator_requirements: form.creator_requirements || null,
        pickup_address: form.pickup_address || null,
        pickup_lat: vendorLat ?? null,
        pickup_lng: vendorLng ?? null,
        delivery_available: form.delivery_available,
        tags: form.tags,
        status: "active",
      }

      if (isEdit) {
        const { error } = await supabase.from("products").update(payload).eq("id", initialData!.id)
        if (error) { toast("error", "Update failed", error.message); return }
        toast("success", "Product updated!")
      } else {
        const { error } = await supabase.from("products").insert(payload)
        if (error) { toast("error", "Failed to create product", error.message); return }
        toast("success", "Product created!", "Your product is now live on the marketplace.")
      }

      router.push("/vendor/products")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <Link href="/vendor/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-5 transition-colors">
        <ArrowLeft size={16} />
        Back to Products
      </Link>

      <h1 className="text-xl font-bold text-gray-900 mb-6">{isEdit ? "Edit Product" : "Add New Product"}</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic info */}
        <div className="card-base p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Basic Information</h2>
          <Input label="Product Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} error={errors.name} required placeholder="e.g. GlowLeaf Face Serum 30ml" />
          <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe your product, its benefits and ingredients..." />
          <SelectField
            label="Category"
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            options={PRODUCT_CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
          />
        </div>

        {/* Pricing */}
        <div className="card-base p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Pricing & Stock</h2>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price (₹)" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} error={errors.price} required placeholder="599" />
            <Input label="Discounted Price (₹)" type="number" value={form.discount_price} onChange={e => setForm(f => ({ ...f, discount_price: e.target.value }))} placeholder="499 (optional)" hint="Leave empty if no discount" />
          </div>
          <Input label="Stock Quantity" type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required />
        </div>

        {/* Commission */}
        <div className="card-base p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Creator Commission</h2>
          <Input
            label="Commission Percentage (%)"
            type="number"
            value={form.commission_percent}
            onChange={e => setForm(f => ({ ...f, commission_percent: e.target.value }))}
            error={errors.commission_percent}
            required
            placeholder="15"
            hint={form.price && form.commission_percent ? `Creator earns ₹${Math.round(Number(form.price) * Number(form.commission_percent) / 100)} per sale` : ""}
          />

          {/* Availability toggles */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={form.sample_available}
                onChange={e => setForm(f => ({ ...f, sample_available: e.target.checked }))}
                className="rounded text-indigo-600 w-4 h-4"
              />
              <div>
                <p className="text-sm font-medium text-gray-700">Free Sample</p>
                <p className="text-xs text-gray-400">Allow creators to request free samples</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={form.barter_available}
                onChange={e => setForm(f => ({ ...f, barter_available: e.target.checked }))}
                className="rounded text-indigo-600 w-4 h-4"
              />
              <div>
                <p className="text-sm font-medium text-gray-700">Barter</p>
                <p className="text-xs text-gray-400">Product in exchange for content</p>
              </div>
            </label>
          </div>

          <Textarea
            label="Creator Requirements"
            value={form.creator_requirements}
            onChange={e => setForm(f => ({ ...f, creator_requirements: e.target.value }))}
            placeholder="e.g. Minimum 5,000 followers, beauty niche, must create at least 1 Reel..."
          />
        </div>

        {/* Location */}
        <div className="card-base p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Pickup & Delivery</h2>
          <Input
            label="Pickup Address"
            value={form.pickup_address}
            onChange={e => setForm(f => ({ ...f, pickup_address: e.target.value }))}
            placeholder="123 Market Street, Koramangala, Bengaluru"
          />
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.delivery_available}
              onChange={e => setForm(f => ({ ...f, delivery_available: e.target.checked }))}
              className="rounded text-indigo-600 w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700">Delivery Available</span>
          </label>
        </div>

        {/* Tags */}
        <div className="card-base p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Tags</h2>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              placeholder="Add a tag and press Enter"
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag() } }}
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={addTag}>
              <Plus size={16} />
            </Button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-xs font-medium">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Link href="/vendor/products" className="flex-1">
            <Button variant="outline" className="w-full">Cancel</Button>
          </Link>
          <Button type="submit" loading={loading} className="flex-1">
            {isEdit ? "Save Changes" : "Publish Product"}
          </Button>
        </div>
      </form>
    </div>
  )
}
