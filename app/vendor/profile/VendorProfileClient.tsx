'use client'

import { useState } from "react"
import { Building2, MapPin, Globe, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input, Textarea, SelectField } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { VENDOR_CATEGORIES } from "@/lib/utils"

interface VendorProfileClientProps {
  vendor: any
  userId: string
}

export function VendorProfileClient({ vendor, userId }: VendorProfileClientProps) {
  const [form, setForm] = useState({
    business_name: vendor?.business_name ?? "",
    owner_name: vendor?.owner_name ?? "",
    phone: vendor?.phone ?? "",
    city: vendor?.city ?? "",
    address: vendor?.address ?? "",
    category: vendor?.category ?? "Retail",
    description: vendor?.description ?? "",
    gstin: vendor?.gstin ?? "",
    website: vendor?.website ?? "",
  })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()
  const router = useRouter()

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const save = async () => {
    setSaving(true)
    const { error } = await supabase.from("vendors").update(form).eq("id", userId)
    if (error) {
      toast("error", "Save failed", error.message)
    } else {
      toast("success", "Profile updated!")
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Business Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your public-facing business information</p>
      </div>

      {/* Verification badge */}
      {vendor?.is_verified && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <CheckCircle size={16} className="text-emerald-600" />
          <p className="text-sm text-emerald-700 font-medium">Verified Business</p>
        </div>
      )}

      <div className="card-base p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Building2 size={16} className="text-indigo-600" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900">Business Details</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Business Name" value={form.business_name} onChange={update("business_name")} required />
          <Input label="Owner Name" value={form.owner_name} onChange={update("owner_name")} required />
          <Input label="Phone" value={form.phone} onChange={update("phone")} placeholder="+91 98765 43210" />
          <Input label="City" value={form.city} onChange={update("city")} required />
          <SelectField
            label="Business Category"
            value={form.category}
            onChange={update("category")}
            options={VENDOR_CATEGORIES.map(c => ({ value: c, label: c }))}
          />
          <Input label="GSTIN (optional)" value={form.gstin} onChange={update("gstin")} placeholder="22AAAAA0000A1Z5" />
          <Input label="Website" value={form.website} onChange={update("website")} placeholder="https://" className="sm:col-span-2" />
          <Textarea label="Address" value={form.address} onChange={update("address")} className="sm:col-span-2" />
          <Textarea
            label="Business Description"
            value={form.description}
            onChange={update("description")}
            placeholder="Tell creators what your business is about..."
            className="sm:col-span-2"
          />
        </div>
        <Button onClick={save} loading={saving}>Save Profile</Button>
      </div>
    </div>
  )
}
