'use client'

import { useState } from "react"
import { Settings, Bell, Shield, LogOut, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface SettingsClientProps {
  user: { id: string; email?: string }
  profile: { full_name: string; city?: string | null }
  role: "vendor" | "creator"
}

export function SettingsClient({ user, profile, role }: SettingsClientProps) {
  const [fullName, setFullName] = useState(profile.full_name)
  const [city, setCity] = useState(profile.city ?? "")
  const [saving, setSaving] = useState(false)
  const [notifEmail, setNotifEmail] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()
  const router = useRouter()

  const saveProfile = async () => {
    setSaving(true)
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, city })
      .eq("id", user.id)

    if (error) {
      toast("error", "Failed to save", error.message)
    } else {
      toast("success", "Settings saved!")
      router.refresh()
    }
    setSaving(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account preferences</p>
      </div>

      {/* Profile section */}
      <div className="card-base p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Settings size={16} className="text-indigo-600" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900">Profile Information</h2>
        </div>
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />
          <Input
            label="City"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="e.g. Bengaluru"
          />
          <Input
            label="Email"
            value={user.email ?? ""}
            disabled
            hint="Email cannot be changed. Contact support if needed."
          />
          <Button onClick={saveProfile} loading={saving}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Notifications */}
      <div className="card-base p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
            <Bell size={16} className="text-blue-600" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
        </div>
        <div className="space-y-3">
          {[
            { label: "Email notifications", description: "Receive updates about orders, requests, and payouts", checked: notifEmail, onChange: () => setNotifEmail(!notifEmail) },
            { label: "New collaborations", description: role === "vendor" ? "Notify when creators request your products" : "Notify when vendors approve your requests", checked: true, onChange: () => {} },
            { label: "Commission updates", description: "Notify when commissions are approved or paid", checked: true, onChange: () => {} },
          ].map(n => (
            <label key={n.label} className="flex items-start gap-4 cursor-pointer">
              <input
                type="checkbox"
                checked={n.checked}
                onChange={n.onChange}
                className="mt-0.5 h-4 w-4 accent-indigo-600 shrink-0"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{n.label}</p>
                <p className="text-xs text-gray-500">{n.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Account */}
      <div className="card-base p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
            <Shield size={16} className="text-gray-600" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900">Account</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-900">Account Role</p>
              <p className="text-xs text-gray-500 capitalize">{role} account</p>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full capitalize font-medium">
              {role}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">MicroMatch Version</p>
              <p className="text-xs text-gray-500">MVP v1.0 — demo mode active</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-indigo-600">
              <Zap size={12} />
              v1.0
            </div>
          </div>
        </div>
        <Button variant="ghost" className="mt-4 text-red-500 hover:text-red-600 hover:bg-red-50 gap-2" onClick={handleLogout}>
          <LogOut size={15} />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
