'use client'

import Link from "next/link"
import Image from "next/image"
import { MapPin, Star, Users } from "lucide-react"
import { Product } from "@/types"
import { formatCurrency, formatDistance, calculateCommission, truncate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge, CategoryBadge, CommissionBadge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface ProductCardProps {
  product: Product
  userLat?: number | null
  userLng?: number | null
  onRequestSample?: (product: Product) => void
  showRequestButton?: boolean
}

export function ProductCard({ product, userLat, userLng, onRequestSample, showRequestButton = true }: ProductCardProps) {
  const primaryImage = product.images?.find(i => i.is_primary) ?? product.images?.[0]
  const effectivePrice = product.discount_price ?? product.price
  const estimatedEarning = calculateCommission(effectivePrice, 1, product.commission_percent)
  
  let distance: string | null = null
  if (userLat && userLng && product.pickup_lat && product.pickup_lng) {
    const { haversineDistance, formatDistance: fmt } = require("@/lib/utils")
    const km = haversineDistance(userLat, userLng, product.pickup_lat, product.pickup_lng)
    distance = fmt(km)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="card-base card-hover overflow-hidden flex flex-col"
    >
      {/* Image */}
      <Link href={`/product/${product.id}`} className="block relative h-44 bg-gray-100 overflow-hidden">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-indigo-50 to-purple-50">
            <span className="text-4xl">🛍️</span>
          </div>
        )}
        {product.barter_available && (
          <div className="absolute top-2 left-2">
            <Badge variant="default" size="sm">Barter Available</Badge>
          </div>
        )}
        {product.sample_available && (
          <div className="absolute top-2 right-2">
            <Badge variant="success" size="sm">Free Sample</Badge>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link href={`/product/${product.id}`} className="hover:text-indigo-600 transition-colors">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                {truncate(product.name, 50)}
              </h3>
            </Link>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            by {product.vendor?.business_name ?? "Local Vendor"}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <CategoryBadge category={product.category} />
          <CommissionBadge percent={product.commission_percent} />
        </div>

        {/* Distance */}
        {distance && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={12} className="text-indigo-400" />
            <span>📍 {distance}</span>
          </div>
        )}

        {/* Price + Earning */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-gray-900 text-base">{formatCurrency(effectivePrice)}</span>
            {product.discount_price && (
              <span className="text-xs text-gray-400 line-through ml-1">{formatCurrency(product.price)}</span>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Earn up to</p>
            <p className="text-sm font-semibold text-emerald-600">{formatCurrency(estimatedEarning)}</p>
          </div>
        </div>

        {/* Actions */}
        {showRequestButton && (
          <div className="flex gap-2 mt-auto pt-1">
            <Link href={`/product/${product.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full text-xs">
                View Details
              </Button>
            </Link>
            {(product.sample_available || product.barter_available) && onRequestSample && (
              <Button
                size="sm"
                className="flex-1 text-xs"
                onClick={() => onRequestSample(product)}
              >
                Request Sample
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function ProductGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {children}
    </div>
  )
}
