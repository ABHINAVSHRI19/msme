'use client'

import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight, Zap, MapPin, TrendingUp, Users, Package, Link2, Star,
  ChevronDown, CheckCircle, IndianRupee, Truck, BarChart2, Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/layout/Navbar"

interface LandingPageProps {
  user?: { id: string; email?: string } | null
  role?: string | null
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const TRUST_METRICS = [
  { value: "2,400+", label: "Local Vendors" },
  { value: "8,500+", label: "Student Creators" },
  { value: "₹1.2Cr+", label: "Commission Paid" },
  { value: "94%", label: "Successful Campaigns" },
]

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Vendor Lists Product",
    description: "Local MSMEs add their products, set commission rates, and enable sample availability.",
    icon: Package,
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    step: "02",
    title: "Creator Discovers",
    description: "Student creators browse nearby products filtered by category, distance, and commission.",
    icon: MapPin,
    color: "bg-purple-50 text-purple-600",
  },
  {
    step: "03",
    title: "Sample Request",
    description: "Creator requests a sample (free, barter, or discounted) and explains their content plan.",
    icon: Users,
    color: "bg-pink-50 text-pink-600",
  },
  {
    step: "04",
    title: "Referral Link Generated",
    description: "Vendor approves and a unique referral link is automatically created for the creator.",
    icon: Link2,
    color: "bg-blue-50 text-blue-600",
  },
  {
    step: "05",
    title: "Promotion & Sales",
    description: "Creator promotes the product. Every click and sale is tracked through their referral link.",
    icon: TrendingUp,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    step: "06",
    title: "Commission Earned",
    description: "When a sale completes, commission is automatically calculated and credited to the creator.",
    icon: IndianRupee,
    color: "bg-amber-50 text-amber-600",
  },
]

const VENDOR_FEATURES = [
  "Zero upfront advertising cost",
  "Pay commission only on actual sales",
  "Access to 8,500+ student creators",
  "Real-time sales & referral analytics",
  "Pooled logistics to reduce shipping costs",
  "GSTIN-ready MSME dashboard",
]

const CREATOR_FEATURES = [
  "Discover products near your college",
  "Request free samples for content",
  "Unique referral link per product",
  "Earn 5–30% commission on every sale",
  "UPI-based instant payouts",
  "Build your creator portfolio",
]

const FEATURED_PRODUCTS = [
  {
    name: "GlowLeaf Face Serum",
    vendor: "GlowLeaf Naturals",
    price: "₹599",
    commission: "18%",
    earn: "₹108",
    category: "Beauty",
    distance: "1.2 km",
    emoji: "✨",
    color: "from-pink-50 to-rose-50",
  },
  {
    name: "Campus Bites Munchbox",
    vendor: "Campus Bites",
    price: "₹299",
    commission: "20%",
    earn: "₹60",
    category: "Food",
    distance: "0.8 km",
    emoji: "🍱",
    color: "from-amber-50 to-orange-50",
  },
  {
    name: "Urban Threads Ethnic Kurta",
    vendor: "Urban Threads",
    price: "₹1,199",
    commission: "15%",
    earn: "₹180",
    category: "Fashion",
    distance: "2.5 km",
    emoji: "👕",
    color: "from-purple-50 to-indigo-50",
  },
  {
    name: "FitFuel Protein Bar (Pack of 10)",
    vendor: "FitFuel Foods",
    price: "₹449",
    commission: "22%",
    earn: "₹99",
    category: "Fitness",
    distance: "3.1 km",
    emoji: "💪",
    color: "from-emerald-50 to-green-50",
  },
]

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Creator — 22k followers",
    college: "Delhi University",
    quote: "I earned ₹4,200 in my first month just by promoting products from shops near my campus. Zero investment!",
    emoji: "🎓",
  },
  {
    name: "Arjun Mehta",
    role: "Vendor — GlowLeaf Naturals",
    city: "Jaipur",
    quote: "We got 12 creators promoting our products in 2 weeks. Sales went up 40% without spending on Instagram ads.",
    emoji: "🏪",
  },
  {
    name: "Sneha Verma",
    role: "Creator — 45k followers",
    college: "BITS Pilani",
    quote: "The referral tracking is amazing. I can see exactly how many clicks led to sales — real data, not guesswork.",
    emoji: "📊",
  },
]

const FAQS = [
  {
    q: "Is MicroMatch free to use?",
    a: "Yes! Joining MicroMatch is completely free for both vendors and creators. Vendors only pay commission when a sale actually happens.",
  },
  {
    q: "How does the referral link work?",
    a: "Each approved creator gets a unique referral link per product. When a customer buys through that link, the creator earns the set commission percentage automatically.",
  },
  {
    q: "What is barter collaboration?",
    a: "Vendors can offer their product in exchange for content (Reels, Posts, Stories) instead of cash. This lets both parties benefit without any money changing hands.",
  },
  {
    q: "How do creators get paid?",
    a: "Commissions accumulate in your earnings dashboard. You can request a payout anytime to your UPI ID or bank account. Minimum payout is ₹200.",
  },
  {
    q: "What is Pooled Logistics?",
    a: "MicroMatch groups nearby orders from the same area and calculates estimated shipping savings when orders are batched together — helping vendors reduce logistics costs.",
  },
  {
    q: "Is it available outside India?",
    a: "Currently MicroMatch is India-focused with INR pricing and UPI payouts. We're planning to expand to Southeast Asia in 2025.",
  },
]

export function LandingPage({ user, role }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} role={role} />

      {/* =================== HERO =================== */}
      <section className="relative overflow-hidden bg-white pt-16 pb-20 lg:pt-24 lg:pb-28">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-60" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-emerald-50 rounded-full blur-3xl opacity-60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium border border-indigo-200 mb-6">
                <Zap size={14} className="text-indigo-500" />
                Zero-Cash Growth for Local Businesses
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight max-w-4xl mx-auto">
              Grow Your Local Business.{" "}
              <span className="gradient-text">Without Paying for Ads.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              MicroMatch connects local MSMEs with student creators who promote products through
              barter and affiliate marketing—turning local products into local growth.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register?role=vendor">
                <Button size="lg" className="gap-2 shadow-lg shadow-indigo-200">
                  Join as Vendor <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/register?role=creator">
                <Button size="lg" variant="outline" className="gap-2">
                  Join as Creator <TrendingUp size={18} />
                </Button>
              </Link>
            </motion.div>

            {/* Demo mode */}
            <motion.div variants={fadeUp} className="mt-5 flex gap-3 justify-center">
              <Link href="/vendor?demo=true">
                <span className="text-sm text-gray-400 hover:text-indigo-600 underline underline-offset-4 transition-colors">
                  Explore as Vendor →
                </span>
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/creator?demo=true">
                <span className="text-sm text-gray-400 hover:text-indigo-600 underline underline-offset-4 transition-colors">
                  Explore as Creator →
                </span>
              </Link>
            </motion.div>

            {/* Visual workflow */}
            <motion.div variants={fadeUp} className="mt-14 flex flex-wrap items-center justify-center gap-2 text-sm">
              {["Vendor", "Product", "Creator", "Promotion", "Referral Link", "Customer", "Sale", "Commission"].map((step, i, arr) => (
                <span key={step} className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-lg font-medium ${
                    i === 0 ? "bg-indigo-100 text-indigo-700" :
                    i === arr.length - 1 ? "bg-emerald-100 text-emerald-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {step}
                  </span>
                  {i < arr.length - 1 && <ArrowRight size={14} className="text-gray-300 shrink-0" />}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* =================== TRUST METRICS =================== */}
      <section className="bg-gray-50 border-y border-gray-100 py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_METRICS.map(m => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-3xl font-extrabold text-indigo-600">{m.value}</p>
                <p className="text-sm text-gray-500 mt-1 font-medium">{m.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== HOW IT WORKS =================== */}
      <section id="how-it-works" className="section-padding bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How MicroMatch Works</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Six simple steps from product listing to creator commission — completely automated.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-base p-6 card-hover"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${step.color}`}>
                  <step.icon size={22} />
                </div>
                <span className="text-xs font-bold text-gray-300 tracking-widest uppercase">{step.step}</span>
                <h3 className="text-base font-semibold text-gray-900 mt-1">{step.title}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== VENDOR / CREATOR SECTIONS =================== */}
      <section id="for-vendors" className="section-padding bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">For Vendors</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-4">Reach Thousands of Customers.<br />Pay Only for Results.</h2>
              <p className="text-gray-500 mt-3 leading-relaxed">List your products, set your own commission rate, and let student creators drive sales — with zero upfront cost to you.</p>
              <ul className="mt-6 space-y-3">
                {VENDOR_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/register?role=vendor">
                  <Button className="gap-2">Join as Vendor <ArrowRight size={16} /></Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="card-base p-6 space-y-3"
            >
              {[
                { label: "Products Listed", value: "24", icon: Package, color: "text-indigo-600" },
                { label: "Active Creators", value: "12", icon: Users, color: "text-purple-600" },
                { label: "Referral Sales", value: "₹48,200", icon: TrendingUp, color: "text-emerald-600" },
                { label: "Shipping Saved", value: "₹3,800", icon: Truck, color: "text-blue-600" },
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <stat.icon size={18} className={stat.color} />
                    <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{stat.value}</span>
                </div>
              ))}
              <p className="text-xs text-center text-gray-400 pt-2">Sample vendor dashboard preview</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="for-creators" className="section-padding bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:order-2"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">For Creators</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-4">Turn Your Audience Into Income.<br />Start with Zero Cash.</h2>
              <p className="text-gray-500 mt-3 leading-relaxed">Discover products near your campus, get free samples, create content, and earn commission on every sale your referral link drives.</p>
              <ul className="mt-6 space-y-3">
                {CREATOR_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/register?role=creator">
                  <Button variant="success" className="gap-2">Join as Creator <ArrowRight size={16} /></Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:order-1 card-base p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <p className="text-sm font-semibold text-gray-900">Your Earnings This Month</p>
                <span className="text-2xl font-extrabold text-emerald-600">₹4,250</span>
              </div>
              {[
                { product: "GlowLeaf Face Serum", clicks: 412, orders: 28, commission: "₹1,512" },
                { product: "Campus Bites Box", clicks: 287, orders: 34, commission: "₹1,020" },
                { product: "Urban Threads Kurta", clicks: 156, orders: 12, commission: "₹1,718" },
              ].map(row => (
                <div key={row.product} className="p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{row.product}</p>
                    <p className="text-sm font-bold text-emerald-600">{row.commission}</p>
                  </div>
                  <div className="flex gap-4 mt-1.5">
                    <span className="text-xs text-gray-400">{row.clicks} clicks</span>
                    <span className="text-xs text-gray-400">{row.orders} orders</span>
                  </div>
                </div>
              ))}
              <p className="text-xs text-center text-gray-400">Sample creator earnings preview</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =================== FEATURED PRODUCTS =================== */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-gray-500 mt-2">Discover local products available for creator collaboration</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURED_PRODUCTS.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card-base card-hover overflow-hidden"
              >
                <div className={`h-32 bg-gradient-to-br ${p.color} flex items-center justify-center text-5xl`}>
                  {p.emoji}
                </div>
                <div className="p-4">
                  <span className="text-xs text-gray-400 font-medium">{p.category} • {p.distance}</span>
                  <h3 className="text-sm font-semibold text-gray-900 mt-1">{p.name}</h3>
                  <p className="text-xs text-gray-500">{p.vendor}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-gray-900 text-base">{p.price}</span>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Earn {p.earn}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/discover">
              <Button variant="outline" className="gap-2">Browse All Products <ArrowRight size={16} /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* =================== POOLED LOGISTICS =================== */}
      <section className="section-padding bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">Pooled Logistics</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-4">Cut Shipping Costs with Order Pooling</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">MicroMatch automatically groups nearby orders to help vendors save on logistics — a unique feature for local businesses.</p>
          </div>
          <div className="card-base p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Visual */}
              <div className="space-y-2">
                {["Order A — Koramangala", "Order B — HSR Layout", "Order C — Indiranagar", "Order D — Koramangala", "Order E — BTM Layout"].map(o => (
                  <div key={o} className="flex items-center gap-3">
                    <div className="text-xs font-medium text-gray-600 w-40 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">{o}</div>
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-200 to-indigo-300 rounded" />
                    <div className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
                      Shared Pickup
                    </div>
                  </div>
                ))}
              </div>
              {/* Savings */}
              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">5 Individual Shipments</span>
                  <span className="text-sm font-semibold text-red-500 line-through">₹500</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Pooled Shipment</span>
                  <span className="text-sm font-semibold text-gray-900">₹320</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">Estimated Savings</span>
                  <span className="text-lg font-extrabold text-emerald-600">₹180 (36%)</span>
                </div>
                <p className="text-xs text-gray-400">* Estimates only. Actual savings depend on carrier and route.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================== TESTIMONIALS =================== */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Loved by Vendors & Creators</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-base p-6"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                    {t.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                    <p className="text-xs text-gray-400">{t.college ?? t.city}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== FAQ =================== */}
      <section id="about" className="section-padding bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="card-base p-5"
              >
                <h3 className="text-sm font-semibold text-gray-900">{faq.q}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== FINAL CTA =================== */}
      <section className="bg-indigo-600 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-white">Ready to Start Growing?</h2>
            <p className="text-indigo-200 mt-3">Join thousands of local vendors and student creators on MicroMatch.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register?role=vendor">
                <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 gap-2">
                  Join as Vendor <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/register?role=creator">
                <Button size="lg" variant="outline" className="border-indigo-400 text-white hover:bg-indigo-700 gap-2">
                  Join as Creator <TrendingUp size={18} />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =================== FOOTER =================== */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <Zap size={15} className="text-white" />
                </div>
                <span className="font-bold text-white text-base">MicroMatch</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">Zero-Cash Growth for Local Businesses. Connecting MSMEs with student creators across India.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div>
                <p className="font-semibold text-white mb-3">Platform</p>
                <div className="space-y-2">
                  <Link href="/discover" className="block hover:text-white transition-colors">Discover</Link>
                  <Link href="/login" className="block hover:text-white transition-colors">Login</Link>
                  <Link href="/register" className="block hover:text-white transition-colors">Register</Link>
                </div>
              </div>
              <div>
                <p className="font-semibold text-white mb-3">For</p>
                <div className="space-y-2">
                  <Link href="/#for-vendors" className="block hover:text-white transition-colors">Vendors</Link>
                  <Link href="/#for-creators" className="block hover:text-white transition-colors">Creators</Link>
                  <Link href="/#how-it-works" className="block hover:text-white transition-colors">How It Works</Link>
                </div>
              </div>
              <div>
                <p className="font-semibold text-white mb-3">Legal</p>
                <div className="space-y-2">
                  <span className="block text-gray-500">Privacy Policy</span>
                  <span className="block text-gray-500">Terms of Service</span>
                  <span className="block text-gray-500">Refund Policy</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-6 text-xs text-center text-gray-600">
            © 2024 MicroMatch. Built for MSMEs. Made in India 🇮🇳
          </div>
        </div>
      </footer>
    </div>
  )
}
