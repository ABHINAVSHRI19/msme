'use client'

import { useState } from "react"
import { User2, CheckCircle } from "lucide-react"
import { Instagram, Youtube, Twitter } from "@/components/common/SocialIcons"
import { Button } from "@/components/ui/button"
import { Input, Textarea, SelectField } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { NICHES } from "@/lib/utils"

interface CreatorProfileClientProps {
  creator: any
  userId: string
}

export function CreatorProfileClient({ creator, userId }: CreatorProfileClientProps) {
  const [form, setForm] = useState({
    name: creator?.name ?? "",
    bio: creator?.bio ?? "",
    college: creator?.college ?? "",
    city: creator?.city ?? "",
    instagram: creator?.instagram ?? "",
    youtube: creator?.youtube ?? "",
    twitter: creator?.twitter ?? "",
    followers_count: creator?.followers_count ?? 0,
    engagement_rate: creator?.engagement_rate ?? 0,
    niche: creator?.niche ?? "",
  })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()
  const router = useRouter()

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const save = async () => {
    setSaving(true)
    const { error } = await supabase
      .from("creators")
      .update({
        ...form,
        followers_count: Number(form.followers_count),
        engagement_rate: Number(form.engagement_rate),
      })
      .eq("id", userId)

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
        <h1 className="text-xl font-bold text-gray-900">Creator Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your public profile seen by vendors</p>
      </div>

      {creator?.is_verified && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <CheckCircle size={16} className="text-emerald-600" />
          <p className="text-sm text-emerald-700 font-medium">Verified Creator</p>
        </div>
      )}

      <div className="card-base p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
            <User2 size={16} className="text-indigo-600" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900">Personal Info</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Display Name" value={form.name} onChange={update("name")} required />
          <Input label="City" value={form.city} onChange={update("city")} />
          <Input label="College / Institution" value={form.college} onChange={update("college")} />
          <SelectField
            label="Content Niche"
            value={form.niche}
            onChange={update("niche")}
            options={[{ value: "", label: "Select niche…" }, ...NICHES.map(n => ({ value: n, label: n }))]}
          />
          <Textarea label="Bio" value={form.bio} onChange={update("bio")} placeholder="Tell vendors about your content..." className="sm:col-span-2" />
        </div>
      </div>

      <div className="card-base p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center">
            <Instagram size={16} className="text-pink-600" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900">Social Links & Stats</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Instagram Handle" value={form.instagram} onChange={update("instagram")} placeholder="@yourhandle" />
          <Input label="YouTube Channel" value={form.youtube} onChange={update("youtube")} placeholder="youtube.com/c/..." />
          <Input label="Twitter / X" value={form.twitter} onChange={update("twitter")} placeholder="@yourhandle" />
          <div />
          <Input label="Total Followers" type="number" value={form.followers_count} onChange={update("followers_count")} />
          <Input label="Avg. Engagement Rate (%)" type="number" step="0.1" value={form.engagement_rate} onChange={update("engagement_rate")} />
        </div>
        <Button onClick={save} loading={saving}>Save Profile</Button>
      </div>
    </div>
  )
}
