'use client'

import { useState, useMemo, useEffect } from "react"
import { Search, SlidersHorizontal, MapPin, X } from "lucide-react"
import { Product, FilterOptions } from "@/types"
import { ProductCard, ProductGrid } from "@/components/cards/ProductCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/common/EmptyState"
import { ProductCardSkeleton } from "@/components/ui/skeleton"
import { PRODUCT_CATEGORIES, haversineDistance } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface DiscoverClientProps {
  products: Product[]
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "highest_commission", label: "Highest Commission" },
  { value: "popular", label: "Most Popular" },
  { value: "nearest", label: "Nearest" },
]

export function DiscoverClient({ products }: DiscoverClientProps) {
  const [filters, setFilters] = useState<FilterOptions>({ sortBy: "newest", search: "" })
  const [showFilters, setShowFilters] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)

  const getLocation = () => {
    setLocating(true)
    navigator.geolocation?.getCurrentPosition(
      pos => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setFilters(f => ({ ...f, sortBy: "nearest" }))
        setLocating(false)
      },
      () => setLocating(false)
    )
  }

  const filtered = useMemo(() => {
    let result = [...products]

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.vendor?.business_name?.toLowerCase().includes(q) ||
        p.category.includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      )
    }

    // Category
    if (filters.category) {
      result = result.filter(p => p.category === filters.category)
    }

    // Commission
    if (filters.minCommission) {
      result = result.filter(p => p.commission_percent >= (filters.minCommission ?? 0))
    }

    // Sample available
    if (filters.sampleAvailable) {
      result = result.filter(p => p.sample_available)
    }

    // Barter available
    if (filters.barterAvailable) {
      result = result.filter(p => p.barter_available)
    }

    // Distance filter
    if (filters.maxDistance && userLocation) {
      result = result.filter(p => {
        if (!p.pickup_lat || !p.pickup_lng) return true
        const dist = haversineDistance(userLocation.lat, userLocation.lng, p.pickup_lat, p.pickup_lng)
        return dist <= (filters.maxDistance ?? 100)
      })
    }

    // Sort
    switch (filters.sortBy) {
      case "highest_commission":
        result.sort((a, b) => b.commission_percent - a.commission_percent)
        break
      case "nearest":
        if (userLocation) {
          result.sort((a, b) => {
            if (!a.pickup_lat || !b.pickup_lat) return 0
            const dA = haversineDistance(userLocation.lat, userLocation.lng, a.pickup_lat, a.pickup_lng!)
            const dB = haversineDistance(userLocation.lat, userLocation.lng, b.pickup_lat, b.pickup_lng!)
            return dA - dB
          })
        }
        break
      case "popular":
        // Sort by stock proxy (in real app, sort by referral clicks)
        result.sort((a, b) => b.stock - a.stock)
        break
      default: // newest
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    return result
  }, [products, filters, userLocation])

  const activeFilterCount = [
    filters.category,
    filters.minCommission,
    filters.sampleAvailable,
    filters.barterAvailable,
    filters.maxDistance,
  ].filter(Boolean).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Discover Products</h1>
        <p className="text-gray-500 text-sm mt-1">Find local products available for creator collaboration</p>
      </div>

      {/* Search + controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search products, vendors, categories..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            leftIcon={<Search size={16} />}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="md"
            className="gap-2 shrink-0"
            onClick={getLocation}
            loading={locating}
          >
            <MapPin size={16} />
            {userLocation ? "📍 Location set" : "Use Location"}
          </Button>
          <Button
            variant="outline"
            size="md"
            className={cn("gap-2 shrink-0", showFilters && "border-indigo-500 text-indigo-600 bg-indigo-50")}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Sort chips */}
      <div className="flex gap-2 flex-wrap mb-4">
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilters(f => ({ ...f, sortBy: opt.value as FilterOptions["sortBy"] }))}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
              filters.sortBy === opt.value
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card-base p-5 mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Category */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Category</p>
            <select
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={filters.category ?? ""}
              onChange={e => setFilters(f => ({ ...f, category: e.target.value as typeof f.category || undefined }))}
            >
              <option value="">All Categories</option>
              {PRODUCT_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Min Commission */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Min Commission</p>
            <select
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={filters.minCommission ?? ""}
              onChange={e => setFilters(f => ({ ...f, minCommission: e.target.value ? Number(e.target.value) : undefined }))}
            >
              <option value="">Any</option>
              <option value="5">5%+</option>
              <option value="10">10%+</option>
              <option value="15">15%+</option>
              <option value="20">20%+</option>
            </select>
          </div>

          {/* Distance */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Max Distance</p>
            <select
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={filters.maxDistance ?? ""}
              onChange={e => setFilters(f => ({ ...f, maxDistance: e.target.value ? Number(e.target.value) : undefined }))}
            >
              <option value="">Any Distance</option>
              <option value="2">Within 2 km</option>
              <option value="5">Within 5 km</option>
              <option value="10">Within 10 km</option>
              <option value="25">Within 25 km</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-700 mb-2">Availability</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!filters.sampleAvailable}
                onChange={e => setFilters(f => ({ ...f, sampleAvailable: e.target.checked || undefined }))}
                className="rounded text-indigo-600"
              />
              <span className="text-xs text-gray-700">Free Sample</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!filters.barterAvailable}
                onChange={e => setFilters(f => ({ ...f, barterAvailable: e.target.checked || undefined }))}
                className="rounded text-indigo-600"
              />
              <span className="text-xs text-gray-700">Barter Available</span>
            </label>
          </div>

          {/* Clear */}
          <div className="flex items-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:bg-red-50 gap-1.5"
              onClick={() => setFilters({ sortBy: "newest", search: "" })}
            >
              <X size={14} />
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try adjusting your filters or search query"
          action={{ label: "Clear Filters", onClick: () => setFilters({ sortBy: "newest", search: "" }) }}
        />
      ) : (
        <ProductGrid>
          {filtered.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              userLat={userLocation?.lat}
              userLng={userLocation?.lng}
            />
          ))}
        </ProductGrid>
      )}
    </div>
  )
}
