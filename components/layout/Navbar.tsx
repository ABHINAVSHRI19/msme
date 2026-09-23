'use client'

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

interface NavbarProps {
  user?: { id: string; email?: string } | null
  role?: string | null
}

const NAV_LINKS = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Discover", href: "/discover" },
  { label: "For Vendors", href: "/#for-vendors" },
  { label: "For Creators", href: "/#for-creators" },
  { label: "About", href: "/#about" },
]

export function Navbar({ user, role }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const dashboardHref = role === "vendor" ? "/vendor" : role === "creator" ? "/creator" : "/login"

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">
              Micro<span className="text-indigo-600">Match</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <Link href={dashboardHref}>
                  <Button variant="outline" size="sm">Dashboard</Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-100 bg-white overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                {user ? (
                  <>
                    <Link href={dashboardHref} className="flex-1" onClick={() => setMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">Dashboard</Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>Sign Out</Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="flex-1" onClick={() => setMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">Log In</Button>
                    </Link>
                    <Link href="/register" className="flex-1" onClick={() => setMenuOpen(false)}>
                      <Button size="sm" className="w-full">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
