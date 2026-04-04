// ============================================================================
// Marketplace Types
// ============================================================================
// Tipos TypeScript para o sistema de marketplace e leilão

// ============================================================================
// WALLET TYPES
// ============================================================================

export interface Wallet {
  account_id: number
  dp: number
  vp: number
  created_at: Date
  updated_at: Date
}

export type TransactionType =
  | 'CREDIT_DP'
  | 'CREDIT_VP'
  | 'DEBIT_DP'
  | 'DEBIT_VP'
  | 'BID_PLACED'
  | 'BID_REFUND'
  | 'AUCTION_WIN'
  | 'MARKETPLACE_PURCHASE'
  | 'MARKETPLACE_SALE'
  | 'MARKETPLACE_FEE'
  | 'ADMIN_ADJUSTMENT'

export type CurrencyType = 'DP' | 'VP'

export type ReferenceType =
  | 'AUCTION'
  | 'MARKETPLACE_LISTING'
  | 'ADMIN_CREDIT'
  | 'DONATION'

export interface WalletTransaction {
  id: number
  account_id: number
  type: TransactionType
  amount: number
  balance_before: number
  balance_after: number
  currency: CurrencyType
  reference_type?: ReferenceType
  reference_id?: number
  notes?: string
  created_at: Date
  created_by?: number
  ip_address?: string
}

// ============================================================================
// WHITELIST TYPES
// ============================================================================

export type ItemCategory =
  | 'MOUNT'
  | 'PET'
  | 'TRANSMOG'
  | 'CONSUMABLE'
  | 'BAG'
  | 'SERVICE'
  | 'OTHER'

export type ItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'

export interface WhitelistItem {
  item_entry: number
  item_name: string
  can_auction: boolean
  can_marketplace: boolean
  max_price?: number
  category: ItemCategory
  rarity: ItemRarity
  notes?: string
  added_by: number
  added_at: Date
  updated_at: Date
}

// ============================================================================
// AUCTION TYPES
// ============================================================================

export type AuctionStatus = 'ACTIVE' | 'CLOSED' | 'WON' | 'CANCELLED'

export interface AuctionItem {
  id: number
  item_entry: number
  item_count: number
  starting_bid: number
  current_bid: number
  buyout_price?: number
  start_time: Date
  end_time: Date
  status: AuctionStatus
  current_bidder_id?: number
  winner_account_id?: number
  created_by: number
  created_at: Date
  closed_at?: Date

  // Dados enriquecidos (da view/join)
  item_name?: string
  category?: ItemCategory
  rarity?: ItemRarity
  seconds_remaining?: number
  total_bids?: number
}

export interface AuctionBid {
  id: number
  auction_id: number
  account_id: number
  bid_amount: number
  is_active: boolean
  created_at: Date
  refunded_at?: Date
}

// ============================================================================
// MARKETPLACE TYPES
// ============================================================================

export type ListingStatus =
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'SOLD'
  | 'CANCELLED'
  | 'REJECTED'

export interface MarketplaceListing {
  id: number
  seller_account_id: number
  character_guid: number
  character_name: string
  item_instance_guid: number
  item_entry: number
  item_count: number
  price: number
  status: ListingStatus

  // Aprovação
  approved_by?: number
  approved_at?: Date
  rejection_reason?: string

  // Venda
  buyer_account_id?: number
  sold_at?: Date
  seller_received?: number
  marketplace_fee?: number

  created_at: Date
  updated_at: Date

  // Dados enriquecidos
  item_name?: string
  category?: ItemCategory
  rarity?: ItemRarity
}

// ============================================================================
// FULFILLMENT TYPES
// ============================================================================

export type FulfillmentType =
  | 'AUCTION_WON'
  | 'MARKETPLACE_BUY'
  | 'MARKETPLACE_SELL_REMOVE'

export type FulfillmentStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'DELIVERED'
  | 'FAILED'

export type DeliveryMethod = 'MAIL' | 'MANUAL' | 'SOAP'

export interface FulfillmentQueue {
  id: number
  type: FulfillmentType
  account_id: number
  character_guid?: number
  character_name?: string
  item_entry: number
  item_count: number
  reference_type: 'AUCTION' | 'MARKETPLACE_LISTING'
  reference_id: number
  status: FulfillmentStatus
  priority: number

  // Fulfillment
  assigned_to?: number
  assigned_at?: Date
  delivered_at?: Date
  delivery_method?: DeliveryMethod
  delivery_notes?: string

  created_at: Date
  updated_at: Date

  // Dados enriquecidos
  item_name?: string
  hours_pending?: number
}

// ============================================================================
// AUDIT LOG TYPES
// ============================================================================

export interface AuditLog {
  id: number
  account_id?: number
  action_type: string
  entity_type?: string
  entity_id?: number
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: Date
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

// Wallet API
export interface WalletBalanceResponse {
  success: boolean
  data?: {
    dp: number
    vp: number
    lastUpdated: Date
  }
  error?: string
}

export interface WalletTransactionsResponse {
  success: boolean
  data?: {
    transactions: WalletTransaction[]
    total: number
    page: number
    perPage: number
  }
  error?: string
}

export interface CreditWalletRequest {
  accountId: number
  currency: CurrencyType
  amount: number
  notes?: string
}

// Auction API
export interface CreateAuctionRequest {
  item_entry: number
  item_count: number
  starting_bid: number
  buyout_price?: number
  duration_hours: number
}

export interface PlaceBidRequest {
  auction_id: number
  bid_amount: number
}

export interface AuctionListResponse {
  success: boolean
  data?: {
    auctions: AuctionItem[]
    total: number
  }
  error?: string
}

// Marketplace API
export interface CreateListingRequest {
  character_guid: number
  item_instance_guid: number
  price: number
}

export interface BuyListingRequest {
  listing_id: number
}

export interface ApproveListingRequest {
  listing_id: number
}

export interface RejectListingRequest {
  listing_id: number
  reason: string
}

export interface MarketplaceListResponse {
  success: boolean
  data?: {
    listings: MarketplaceListing[]
    total: number
  }
  error?: string
}

// Admin API
export interface FulfillmentQueueResponse {
  success: boolean
  data?: {
    queue: FulfillmentQueue[]
    total: number
  }
  error?: string
}

export interface MarkDeliveredRequest {
  fulfillment_id: number
  delivery_method: DeliveryMethod
  delivery_notes?: string
}

export interface AuditLogResponse {
  success: boolean
  data?: {
    logs: AuditLog[]
    total: number
    page: number
    perPage: number
  }
  error?: string
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page?: number
  perPage?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FilterParams {
  category?: ItemCategory
  rarity?: ItemRarity
  minPrice?: number
  maxPrice?: number
  search?: string
}
