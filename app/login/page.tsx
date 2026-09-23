'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Zap, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/toast"

export default function LoginPage() {
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
    if (!email) e.email = "Email is required"
    if (!password) e.password = "Password is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        toast("error", "Login failed", error.message)
        return
      }
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single()

        toast("success", "Welcome back!", "Redirecting to dashboard...")
        if (profile?.role === "vendor") {
          router.push("/vendor")
        } else if (profile?.role === "creator") {
          router.push("/creator")
        } else {
          router.push("/")
        }
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex w-1/2 bg-indigo-600 flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">MicroMatch</span>
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-white leading-tight">
            Zero-Cash Growth<br />for Local Businesses
          </h2>
          <p className="text-indigo-200 mt-3 leading-relaxed">
            Connect with student creators and grow your business through affiliate marketing — without spending on ads.
          </p>
        </div>
        <div className="text-indigo-300 text-sm">
          © 2024 MicroMatch. Made in India 🇮🇳
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">MicroMatch</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to your account to continue</p>

          <form onSubmit={handleLogin} className="mt-7 space-y-4" noValidate>
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
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={errors.password}
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button type="button" onClick={() => setShowPw(!showPw)} className="hover:text-gray-600 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              required
            />

            <Button type="submit" loading={loading} className="w-full mt-2">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link href="/register" className="text-indigo-600 font-medium hover:underline">
                Create one free
              </Link>
            </p>
          </div>

          {/* Demo shortcuts */}
          <div className="mt-8 p-4 rounded-xl bg-blue-50 border border-blue-200">
            <p className="text-xs font-semibold text-blue-700 mb-2">🎯 Demo Access</p>
            <p className="text-xs text-blue-600 mb-3">Explore without a real account:</p>
            <div className="flex gap-2">
              <Link href="/vendor?demo=true" className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs">Vendor Demo</Button>
              </Link>
              <Link href="/creator?demo=true" className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs">Creator Demo</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
