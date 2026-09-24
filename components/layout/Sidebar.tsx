'use client'

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Search, Megaphone, Package, Link2, ShoppingBag,
  DollarSign, CreditCard, BarChart2, MessageSquare, User, Settings,
  LogOut, Zap, ChevronDown, X, Menu, Store, Users, Truck, Receipt
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const CREATOR_NAV = [
  { label: "Dashboard", href: "/creator", icon: LayoutDashboard },
  { label: "Discover", href: "/creator/discover", icon: Search },
  { label: "Campaigns", href: "/creator/campaigns", icon: Megaphone },
  { label: "Sample Requests", href: "/creator/requests", icon: Package },
  { label: "Referral Links", href: "/creator/referrals", icon: Link2 },
  { label: "Sales", href: "/creator/sales", icon: ShoppingBag },
  { label: "Earnings", href: "/creator/earnings", icon: DollarSign },
  { label: "Payouts", href: "/creator/payouts", icon: CreditCard },
  { label: "Analytics", href: "/creator/analytics", icon: BarChart2 },
  { label: "Messages", href: "/creator/messages", icon: MessageSquare },
  { label: "Profile", href: "/creator/profile", icon: User },
  { label: "Settings", href: "/creator/settings", icon: Settings },
]

const VENDOR_NAV = [
  { label: "Dashboard", href: "/vendor", icon: LayoutDashboard },
  { label: "Products", href: "/vendor/products", icon: Package },
  { label: "Creator Requests", href: "/vendor/requests", icon: Users },
  { label: "Campaigns", href: "/vendor/campaigns", icon: Megaphone },
  { label: "Orders", href: "/vendor/orders", icon: ShoppingBag },
  { label: "Sales", href: "/vendor/sales", icon: DollarSign },
  { label: "Analytics", href: "/vendor/analytics", icon: BarChart2 },
  { label: "Logistics", href: "/vendor/logistics", icon: Truck },
  { label: "Payouts", href: "/vendor/payouts", icon: Receipt },
  { label: "Messages", href: "/vendor/messages", icon: MessageSquare },
  { label: "Profile", href: "/vendor/profile", icon: Store },
  { label: "Settings", href: "/vendor/settings", icon: Settings },
]

interface SidebarProps {
  role: "vendor" | "creator"
  userName?: string
  userEmail?: string
}

import { useSearchParams } from "next/navigation"

function NavItems({ items, pathname }: { items: typeof CREATOR_NAV; pathname: string }) {
  const searchParams = useSearchParams()
  const isDemo = searchParams.get("demo") === "true"

  return (
    <div className="space-y-0.5">
      {items.map(item => {
        const isActive = pathname === item.href || (item.href !== "/creator" && item.href !== "/vendor" && pathname.startsWith(item.href))
        const targetHref = isDemo ? `${item.href}?demo=true` : item.href
        return (
          <Link
            key={item.href}
            href={targetHref}
            className={cn(
              "sidebar-item",
              isActive && "active"
            )}
          >
            <item.icon size={17} />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}

export function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const items = role === "creator" ? CREATOR_NAV : VENDOR_NAV

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-gray-100 bg-white overflow-y-auto scrollbar-thin">
      {/* Logo */}
      <div className="p-4 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Zap size={15} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-base">
            Micro<span className="text-indigo-600">Match</span>
          </span>
        </Link>
      </div>

      {/* User info */}
      <div className="px-3 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-gray-50">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <span className="text-indigo-700 font-semibold text-xs">
              {(userName ?? userEmail ?? "U")[0].toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-900 truncate">{userName ?? "User"}</p>
            <p className="text-xs text-gray-400 capitalize">{role}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 p-3">
        <NavItems items={items} pathname={pathname} />
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={17} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

// Mobile nav drawer
export function MobileNav({ role, userName }: { role: "vendor" | "creator"; userName?: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const items = role === "creator" ? CREATOR_NAV : VENDOR_NAV

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <>
      {/* Top bar for mobile */}
      <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-gray-100 bg-white sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Zap size={15} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-base">
            Micro<span className="text-indigo-600">Match</span>
          </span>
        </Link>
        <button onClick={() => setOpen(true)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100">
          <Menu size={20} />
        </button>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Zap size={15} className="text-white" />
                  </div>
                  <span className="font-bold text-gray-900 text-base">
                    Micro<span className="text-indigo-600">Match</span>
                  </span>
                </Link>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                <div onClick={() => setOpen(false)}>
                  <NavItems items={items} pathname={pathname} />
                </div>
              </div>

              <div className="p-3 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="sidebar-item w-full text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut size={17} />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
