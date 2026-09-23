// ==========================================
// MICROMATCH — Database Types
// ==========================================

export type UserRole = 'vendor' | 'creator'

export type ProductCategory =
  | 'fashion'
  | 'beauty'
  | 'food'
  | 'fitness'
  | 'electronics'
  | 'home'
  | 'lifestyle'
  | 'handmade'
  | 'services'
  | 'other'

export type SampleType = 'free' | 'barter' | 'discounted'
export type ContentType = 'reel' | 'story' | 'short' | 'post' | 'other'

export type RequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'shipped'
  | 'delivered'
  | 'content_pending'
  | 'completed'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type CommissionStatus = 'pending' | 'approved' | 'available' | 'paid' | 'cancelled'

export type PayoutStatus = 'requested' | 'processing' | 'paid' | 'rejected'

export type LogisticsGroupStatus = 'draft' | 'active' | 'shipped'

export type NotificationType =
  | 'sample_request'
  | 'request_approved'
  | 'request_rejected'
  | 'new_sale'
  | 'commission_earned'
  | 'payout_processed'
  | 'order_update'
  | 'new_message'

// ==========================================
// TABLE TYPES
// ==========================================

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  email: string
  avatar_url: string | null
  city: string | null
  lat: number | null
  lng: number | null
  created_at: string
  updated_at: string
}

export interface Vendor {
  id: string
  business_name: string
  owner_name: string
  phone: string | null
  email: string
  city: string
  address: string | null
  lat: number | null
  lng: number | null
  category: string
  description: string | null
  gstin: string | null
  website: string | null
  social_url: string | null
  logo_url: string | null
  is_verified: boolean
  created_at: string
}

export interface Creator {
  id: string
  name: string
  bio: string | null
  college: string | null
  city: string | null
  lat: number | null
  lng: number | null
  avatar_url: string | null
  instagram: string | null
  youtube: string | null
  twitter: string | null
  followers_count: number
  engagement_rate: number
  niche: string | null
  is_verified: boolean
  created_at: string
}

export interface Product {
  id: string
  vendor_id: string
  name: string
  description: string | null
  category: ProductCategory
  price: number
  discount_price: number | null
  stock: number
  commission_percent: number
  sample_available: boolean
  barter_available: boolean
  creator_requirements: string | null
  pickup_lat: number | null
  pickup_lng: number | null
  pickup_address: string | null
  delivery_available: boolean
  status: 'active' | 'paused' | 'deleted'
  tags: string[]
  created_at: string
  updated_at: string
  // Joined
  vendor?: Vendor
  images?: ProductImage[]
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  is_primary: boolean
  sort_order: number
}

export interface CreatorProductRequest {
  id: string
  creator_id: string
  product_id: string
  vendor_id: string
  sample_type: SampleType
  content_type: ContentType
  message: string | null
  status: RequestStatus
  vendor_note: string | null
  created_at: string
  updated_at: string
  // Joined
  creator?: Creator
  product?: Product
  vendor?: Vendor
  referral_link?: ReferralLink
}

export interface ReferralLink {
  id: string
  code: string
  creator_id: string
  product_id: string
  request_id: string
  is_active: boolean
  created_at: string
  // Computed
  total_clicks?: number
  unique_clicks?: number
  total_orders?: number
  total_commission?: number
  // Joined
  creator?: Creator
  product?: Product
}

export interface ReferralClick {
  id: string
  referral_link_id: string
  ip_hash: string | null
  user_agent: string | null
  device_type: string | null
  clicked_at: string
  order_id: string | null
}

export interface Order {
  id: string
  product_id: string
  vendor_id: string
  referral_link_id: string | null
  creator_id: string | null
  customer_name: string
  customer_phone: string
  customer_email: string
  delivery_address: string
  city: string
  pincode: string
  state: string
  quantity: number
  unit_price: number
  subtotal: number
  delivery_fee: number
  total: number
  status: OrderStatus
  payment_status: 'pending' | 'paid' | 'refunded'
  payment_method: string
  created_at: string
  updated_at: string
  // Joined
  product?: Product
  creator?: Creator
  commission?: Commission
}

export interface Commission {
  id: string
  order_id: string
  creator_id: string
  referral_link_id: string
  product_id: string
  vendor_id: string
  sale_amount: number
  commission_percent: number
  commission_amount: number
  status: CommissionStatus
  payout_id: string | null
  created_at: string
  approved_at: string | null
  paid_at: string | null
  // Joined
  order?: Order
  product?: Product
}

export interface Payout {
  id: string
  creator_id: string
  amount: number
  upi_id: string | null
  account_holder: string | null
  status: PayoutStatus
  requested_at: string
  processed_at: string | null
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  is_read: boolean
  data: Record<string, unknown> | null
  created_at: string
}

export interface Conversation {
  id: string
  vendor_id: string
  creator_id: string
  last_message_at: string | null
  unread_vendor: number
  unread_creator: number
  // Joined
  vendor?: Vendor
  creator?: Creator
  last_message?: Message
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender_role: UserRole
  content: string
  created_at: string
  is_read: boolean
}

export interface LogisticsGroup {
  id: string
  vendor_id: string
  city: string
  area_name: string | null
  center_lat: number | null
  center_lng: number | null
  radius_km: number
  individual_cost: number
  pooled_cost: number
  estimated_savings: number
  status: LogisticsGroupStatus
  created_at: string
  // Joined
  orders?: Order[]
}

// ==========================================
// UTILITY TYPES
// ==========================================

export interface DashboardStats {
  totalClicks: number
  totalOrders: number
  totalRevenue: number
  totalCommission: number
  pendingCommission: number
  availableBalance: number
  conversionRate: number
}

export interface VendorDashboardStats {
  productsListed: number
  activeCreators: number
  referralSales: number
  commissionPaid: number
  shippingSaved: number
  conversionRate: number
  totalRevenue: number
}

export interface ChartDataPoint {
  date: string
  clicks?: number
  orders?: number
  revenue?: number
  commission?: number
}

export interface FilterOptions {
  category?: ProductCategory | ''
  maxDistance?: number
  minCommission?: number
  sampleAvailable?: boolean
  barterAvailable?: boolean
  tags?: string[]
  sortBy?: 'nearest' | 'highest_commission' | 'newest' | 'popular'
  search?: string
}
