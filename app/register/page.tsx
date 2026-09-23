'use client'

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Zap, Mail, Lock, User, Eye, EyeOff, Store, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { Suspense } from "react"

function RegisterForm() {
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") as "vendor" | "creator" | null

  const [role, setRole] = useState<"vendor" | "creator">(defaultRole ?? "creator")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = "Name is required"
    if (!email) e.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email"
    if (!password) e.password = "Password is required"
    else if (password.length < 6) e.password = "Password must be at least 6 characters"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name, role } },
      })

      if (error) {
        toast("error", "Registration failed", error.message)
        return
      }

      if (data.user) {
        // Create profile row
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          role,
          full_name: name,
          email,
        })

        if (profileError && profileError.code !== "23505") {
          // 23505 = unique violation (profile might already exist from trigger)
          console.error("Profile insert error:", profileError)
        }

        toast("success", "Account created!", "Complete your profile to get started.")
        router.push(role === "vendor" ? "/vendor/profile" : "/creator/profile")
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-indigo-600 flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">MicroMatch</span>
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-white leading-tight">
            Join India's fastest growing<br />creator-commerce platform
          </h2>
          <div className="mt-6 space-y-3">
            {[
              "Zero upfront cost — pay only on sales",
              "Unique referral links per product",
              "Discover local products near you",
              "UPI payouts, real-time analytics",
            ].map(t => (
              <div key={t} className="flex items-center gap-2.5 text-sm text-indigo-200">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>
        <p className="text-indigo-300 text-sm">© 2024 MicroMatch. Made in India 🇮🇳</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">MicroMatch</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1 text-sm">Free to join. Start in minutes.</p>

          {/* Role selector */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              { value: "vendor", label: "I'm a Vendor", desc: "Local business / MSME", icon: Store },
              { value: "creator", label: "I'm a Creator", desc: "Student / Influencer", icon: GraduationCap },
            ].map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value as "vendor" | "creator")}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all",
                  role === r.value
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <r.icon size={22} className={role === r.value ? "text-indigo-600" : "text-gray-400"} />
                <p className={cn("text-sm font-semibold mt-2", role === r.value ? "text-indigo-700" : "text-gray-700")}>{r.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleRegister} className="mt-5 space-y-4" noValidate>
            <Input
              label={role === "vendor" ? "Business Owner Name" : "Your Name"}
              type="text"
              placeholder={role === "vendor" ? "e.g. Rahul Gupta" : "e.g. Priya Sharma"}
              value={name}
              onChange={e => setName(e.target.value)}
              error={errors.name}
              leftIcon={<User size={16} />}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={errors.email}
              leftIcon={<Mail size={16} />}
              required
            />
            <Input
              label="Password"
              type={showPw ? "text" : "password"}
              placeholder="Min. 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={errors.password}
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button type="button" onClick={() => setShowPw(!showPw)} className="hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              required
            />

            <Button type="submit" loading={loading} className="w-full mt-2">
              Create {role === "vendor" ? "Vendor" : "Creator"} Account
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 font-medium hover:underline">Sign In</Link>
          </p>

          <p className="mt-4 text-center text-xs text-gray-400">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading...</div></div>}>
      <RegisterForm />
    </Suspense>
  )
}
