'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  MapPin, Star, Package, Link2, ShoppingCart, ArrowLeft,
  CheckCircle, Users, TrendingUp, Copy, ExternalLink
} from "lucide-react"
import { Product } from "@/types"
import { formatCurrency, calculateCommission, setReferralCookie } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge, CategoryBadge, CommissionBadge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { Input, Textarea, SelectField } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { createClient } from "@/lib/supabase/client"

interface ProductDetailClientProps {
  product: Product
  user?: { id: string; email?: string } | null
  role?: string | null
  referralId?: string
  existingReferralLink?: { id: string; code: string } | null
}

export function ProductDetailClient({
  product,
  user,
  role,
  referralId,
  existingReferralLink,
}: ProductDetailClientProps) {
  const [activeImage, setActiveImage] = useState(0)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [requestData, setRequestData] = useState({
    sample_type: "free",
    content_type: "reel",
    message: "",
  })
  const [requestLoading, setRequestLoading] = useState(false)
  const [referralLink, setReferralLink] = useState<string | null>(
    existingReferralLink
      ? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/r/${existingReferralLink.code}`
      : null
  )
  const { toast } = useToast()
  const supabase = createClient()
  const router = useRouter()

  const images = product.images?.sort((a, b) => a.sort_order - b.sort_order) ?? []
  const effectivePrice = product.discount_price ?? product.price
  const estimatedEarning = calculateCommission(effectivePrice, 1, product.commission_percent)

  // Store referral in cookie if opened via referral link
  useEffect(() => {
    if (referralId) {
      setReferralCookie(referralId)
    }
  }, [referralId])

  const handleRequestSample = async () => {
    if (!user) { router.push("/login"); return }
    if (!requestData.message.trim()) {
      toast("error", "Please add a message explaining your fit")
      return
    }
    setRequestLoading(true)
    try {
      const { error } = await supabase.from("creator_product_requests").insert({
        creator_id: user.id,
        product_id: product.id,
        vendor_id: product.vendor_id,
        sample_type: requestData.sample_type,
        content_type: requestData.content_type,
        message: requestData.message,
        status: "pending",
      })
      if (error) {
        if (error.code === "23505") {
          toast("warning", "Already requested", "You already have an active request for this product.")
        } else {
          toast("error", "Request failed", error.message)
        }
        return
      }
      toast("success", "Sample requested!", "Vendor will review your request shortly.")
      setShowRequestModal(false)
    } finally {
      setRequestLoading(false)
    }
  }

  const copyReferralLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink)
      toast("success", "Referral link copied!", "Share it to start earning commissions.")
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link href="/discover" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft size={16} />
        Back to Discover
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden bg-gray-100">
            {images.length > 0 ? (
              <Image
                src={images[activeImage]?.url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-7xl">🛍️</div>
            )}
            {product.sample_available && (
              <div className="absolute top-4 left-4">
                <Badge variant="success">Free Sample Available</Badge>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    i === activeImage ? "border-indigo-500" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              <CategoryBadge category={product.category} />
              <CommissionBadge percent={product.commission_percent} />
              {product.barter_available && <Badge variant="default" size="sm">Barter Available</Badge>}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-500 text-sm mt-1">by {product.vendor?.business_name}</p>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-gray-900">{formatCurrency(effectivePrice)}</span>
            {product.discount_price && (
              <span className="text-lg text-gray-400 line-through">{formatCurrency(product.price)}</span>
            )}
          </div>

          {/* Creator earning */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className="text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">Creator Earnings</span>
            </div>
            <p className="text-2xl font-extrabold text-emerald-600">{formatCurrency(estimatedEarning)}</p>
            <p className="text-xs text-emerald-600 mt-0.5">per sale at {product.commission_percent}% commission</p>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <Package size={16} className="text-gray-400" />
            <span className="text-sm text-gray-500">
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">About this product</p>
              <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Creator requirements */}
          {product.creator_requirements && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-700 mb-1">Creator Requirements</p>
              <p className="text-xs text-blue-600">{product.creator_requirements}</p>
            </div>
          )}

          {/* Referral link (if creator has one) */}
          {referralLink && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-indigo-700 mb-2">Your Referral Link</p>
              <div className="flex gap-2">
                <code className="flex-1 text-xs bg-white border border-indigo-200 rounded-lg px-3 py-2 text-indigo-700 truncate">
                  {referralLink}
                </code>
                <Button size="sm" variant="outline" onClick={copyReferralLink} className="shrink-0">
                  <Copy size={14} />
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2">
            {/* Creator actions */}
            {(role === "creator" || !user) && (product.sample_available || product.barter_available) && (
              <Button
                size="lg"
                className="gap-2"
                onClick={() => user ? setShowRequestModal(true) : router.push("/login")}
              >
                <Package size={18} />
                Request Sample
              </Button>
            )}

            {/* Buy now */}
            <Button
              size="lg"
              variant={role === "creator" ? "outline" : "default"}
              className="gap-2"
              onClick={() => setShowCheckout(true)}
            >
              <ShoppingCart size={18} />
              Buy Now — {formatCurrency(effectivePrice)}
            </Button>
          </div>

          {/* Vendor info */}
          <div className="card-base p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              {product.vendor?.logo_url ? (
                <Image src={product.vendor.logo_url} alt="" width={40} height={40} className="rounded-xl object-cover" />
              ) : (
                <span className="text-lg">🏪</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{product.vendor?.business_name}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                <MapPin size={12} />
                {product.vendor?.city ?? "India"}
              </div>
            </div>
            {product.vendor?.is_verified && (
              <div className="flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle size={14} />
                Verified
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sample Request Modal */}
      <Modal
        open={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Request Sample"
        description={`Request a sample from ${product.vendor?.business_name}`}
      >
        <div className="space-y-4">
          <SelectField
            label="Sample Type"
            value={requestData.sample_type}
            onChange={e => setRequestData(d => ({ ...d, sample_type: e.target.value }))}
            options={[
              { value: "free", label: "Free Sample" },
              { value: "barter", label: "Barter (Product for Content)" },
              { value: "discounted", label: "Discounted Sample" },
            ]}
          />
          <SelectField
            label="Content Type I'll Create"
            value={requestData.content_type}
            onChange={e => setRequestData(d => ({ ...d, content_type: e.target.value }))}
            options={[
              { value: "reel", label: "Instagram Reel / YouTube Short" },
              { value: "story", label: "Story" },
              { value: "post", label: "Feed Post" },
              { value: "short", label: "YouTube Short" },
              { value: "other", label: "Other" },
            ]}
          />
          <Textarea
            label="Why are you a good fit?"
            placeholder="Tell the vendor about your audience, niche, and how you'll promote this product..."
            value={requestData.message}
            onChange={e => setRequestData(d => ({ ...d, message: e.target.value }))}
            required
          />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowRequestModal(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              loading={requestLoading}
              onClick={handleRequestSample}
            >
              Send Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          product={product}
          onClose={() => setShowCheckout(false)}
          referralId={referralId}
        />
      )}
    </div>
  )
}

// Inline checkout modal
function CheckoutModal({
  product,
  onClose,
  referralId,
}: {
  product: Product
  onClose: () => void
  referralId?: string
}) {
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    delivery_address: "",
    city: "",
    pincode: "",
    state: "",
    quantity: 1,
  })
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const effectivePrice = product.discount_price ?? product.price
  const subtotal = effectivePrice * form.quantity
  const deliveryFee = subtotal >= 500 ? 0 : 50
  const total = subtotal + deliveryFee

  // Get referral cookie (set by /r/[code] redirect)
  const getReferralId = () => {
    if (referralId) return referralId
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/micromatch_ref=([^;]+)/)
      return match?.[1] ?? null
    }
    return null
  }

  const handlePlaceOrder = async () => {
    const required = ["customer_name", "customer_phone", "customer_email", "delivery_address", "city", "pincode", "state"]
    const missing = required.filter(k => !form[k as keyof typeof form])
    if (missing.length > 0) {
      toast("error", "Please fill all required fields")
      return
    }
    setLoading(true)
    try {
      const activeReferralId = getReferralId()

      // Get creator_id from referral link
      let creatorId: string | null = null
      if (activeReferralId) {
        const { data: refLink } = await supabase
          .from("referral_links")
          .select("creator_id")
          .eq("id", activeReferralId)
          .single()
        creatorId = refLink?.creator_id ?? null
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          product_id: product.id,
          vendor_id: product.vendor_id,
          referral_link_id: activeReferralId ?? null,
          creator_id: creatorId,
          customer_name: form.customer_name,
          customer_phone: form.customer_phone,
          customer_email: form.customer_email,
          delivery_address: form.delivery_address,
          city: form.city,
          pincode: form.pincode,
          state: form.state,
          quantity: form.quantity,
          unit_price: effectivePrice,
          subtotal,
          delivery_fee: deliveryFee,
          total,
          status: "pending",
          payment_status: "pending",
          payment_method: "mock",
        })
        .select("id")
        .single()

      if (orderError) {
        toast("error", "Order failed", orderError.message)
        return
      }

      // Mock payment — confirm order
      await supabase.from("orders").update({ status: "confirmed", payment_status: "paid" }).eq("id", order.id)

      // Calculate and create commission if referred
      if (creatorId && activeReferralId) {
        await supabase.from("commissions").insert({
          order_id: order.id,
          creator_id: creatorId,
          referral_link_id: activeReferralId,
          product_id: product.id,
          vendor_id: product.vendor_id,
          sale_amount: total,
          commission_percent: product.commission_percent,
          commission_amount: Math.round((total * product.commission_percent) / 100),
          status: "approved",
        })

        // Update referral click with order_id
        await supabase
          .from("referral_clicks")
          .update({ order_id: order.id })
          .eq("referral_link_id", activeReferralId)
          .is("order_id", null)
          .order("clicked_at", { ascending: false })
          .limit(1)

        // Clear referral cookie
        if (typeof document !== "undefined") {
          document.cookie = "micromatch_ref=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
        }
      }

      setOrderId(order.id)
      setOrderPlaced(true)
      toast("success", "Order placed!", "Your order has been confirmed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={orderPlaced ? "Order Confirmed! 🎉" : "Complete Your Order"}
      size="lg"
    >
      {orderPlaced ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Order Placed Successfully!</h3>
          <p className="text-gray-500 text-sm mt-2">Order #{orderId?.slice(-8).toUpperCase()}</p>
          <p className="text-gray-500 text-sm mt-1">Total: {formatCurrency(total)}</p>
          {referralId && <p className="text-xs text-emerald-600 mt-3">Commission credited to creator 🎉</p>}
          <Button className="mt-6 w-full" onClick={onClose}>Done</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Product summary */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
            <div className="text-2xl">🛍️</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{product.name}</p>
              <p className="text-xs text-gray-500">{formatCurrency(effectivePrice)} × {form.quantity}</p>
            </div>
            <p className="font-bold text-gray-900">{formatCurrency(total)}</p>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Quantity</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setForm(f => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
              >-</button>
              <span className="font-semibold w-8 text-center">{form.quantity}</span>
              <button
                onClick={() => setForm(f => ({ ...f, quantity: Math.min(product.stock || 10, f.quantity + 1) }))}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
              >+</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Full Name" value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} required placeholder="Priya Sharma" />
            <Input label="Phone" value={form.customer_phone} onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))} required placeholder="+91 98765 43210" />
            <Input label="Email" type="email" value={form.customer_email} onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))} required placeholder="priya@example.com" className="sm:col-span-2" />
            <Input label="Delivery Address" value={form.delivery_address} onChange={e => setForm(f => ({ ...f, delivery_address: e.target.value }))} required placeholder="123 Main Street" className="sm:col-span-2" />
            <Input label="City" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} required placeholder="Bengaluru" />
            <Input label="Pincode" value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} required placeholder="560001" />
            <Input label="State" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} required placeholder="Karnataka" className="sm:col-span-2" />
          </div>

          {/* Order summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span>{deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee)}</span></div>
            <div className="flex justify-between font-bold border-t border-gray-200 pt-2">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">Mock payment — no real money charged</p>

          <Button loading={loading} className="w-full" size="lg" onClick={handlePlaceOrder}>
            Place Order — {formatCurrency(total)}
          </Button>
        </div>
      )}
    </Modal>
  )
}
