import { Database } from '@/lib/types/database.types'

export type PaymentStatus = 
  | 'succeeded'
  | 'processing'
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'canceled'

export interface GhostProfile {
  id: string
  email: string
  stripeCustomerId: string
  isClaimed: boolean
  displayName: string
  createdAt: string
  updatedAt: string
  lastPurchaseDate: string | null
  totalPurchases: number
  totalSpent: number
  isVisible: boolean
  claimedProfileId: string | null
  metadata: {
    isTest?: boolean
    environment?: string
    [key: string]: any
  }
}

export interface StripeTransaction {
  id: string
  artworkId: string
  buyerId?: string
  ghostProfileId?: string
  
  // Payment intent details
  stripePaymentIntentId: string
  stripeCustomerId: string
  amount: number
  amountReceived?: number
  currency: string
  paymentStatus: PaymentStatus
  paymentIntentStatus: string
  captureMethod?: string
  clientSecret?: string
  confirmationMethod?: string
  description?: string
  invoiceId?: string
  statementDescriptor?: string
  statementDescriptorSuffix?: string

  // Payment method details
  paymentMethodId?: string
  paymentMethodTypes: string[]
  paymentMethodDetails?: {
    type: string
    card?: {
      brand: string
      last4: string
      expMonth: number
      expYear: number
      country: string
    }
  }
  
  // Timestamps
  stripeCreated: string
  stripeCanceledAt?: string
  stripeProcessingAt?: string
  stripeSucceededAt?: string
  createdAt: string
  updatedAt: string
  
  // Additional data
  metadata: {
    isTest?: boolean
    environment?: string
    [key: string]: any
  }
  errorMessage?: string
  errorCode?: string
  lastPaymentError?: any
}

// Database types
export type DbGhostProfile = Database['public']['Tables']['ghost_profiles']['Row']
export type DbTransaction = Database['public']['Tables']['transactions']['Row']

// Conversion utilities
export function toGhostProfile(dbProfile: DbGhostProfile): GhostProfile {
  return {
    id: dbProfile.id,
    email: dbProfile.email,
    stripeCustomerId: dbProfile.stripe_customer_id,
    isClaimed: dbProfile.is_claimed,
    displayName: dbProfile.display_name,
    createdAt: dbProfile.created_at,
    updatedAt: dbProfile.updated_at,
    lastPurchaseDate: dbProfile.last_purchase_date,
    totalPurchases: dbProfile.total_purchases,
    totalSpent: dbProfile.total_spent,
    isVisible: dbProfile.is_visible,
    claimedProfileId: dbProfile.claimed_profile_id,
    metadata: dbProfile.metadata
  }
}

export function toTransaction(dbTransaction: DbTransaction): StripeTransaction {
  return {
    id: dbTransaction.id,
    artworkId: dbTransaction.artwork_id,
    buyerId: dbTransaction.buyer_id ?? undefined,
    ghostProfileId: dbTransaction.ghost_profile_id ?? undefined,
    stripePaymentIntentId: dbTransaction.stripe_payment_intent_id,
    stripeCustomerId: dbTransaction.stripe_customer_id,
    amount: dbTransaction.amount_total,
    amountReceived: dbTransaction.amount_received ?? undefined,
    currency: dbTransaction.currency,
    paymentStatus: dbTransaction.status as PaymentStatus,
    paymentIntentStatus: dbTransaction.payment_intent_status,
    captureMethod: dbTransaction.capture_method ?? undefined,
    clientSecret: dbTransaction.client_secret ?? undefined,
    confirmationMethod: dbTransaction.confirmation_method ?? undefined,
    description: dbTransaction.description ?? undefined,
    invoiceId: dbTransaction.invoice_id ?? undefined,
    statementDescriptor: dbTransaction.statement_descriptor ?? undefined,
    statementDescriptorSuffix: dbTransaction.statement_descriptor_suffix ?? undefined,
    paymentMethodId: dbTransaction.payment_method_id ?? undefined,
    paymentMethodTypes: dbTransaction.payment_method_types ?? [],
    paymentMethodDetails: dbTransaction.payment_method_details,
    stripeCreated: dbTransaction.stripe_created,
    stripeCanceledAt: dbTransaction.stripe_canceled_at ?? undefined,
    stripeProcessingAt: dbTransaction.stripe_processing_at ?? undefined,
    stripeSucceededAt: dbTransaction.stripe_succeeded_at ?? undefined,
    createdAt: dbTransaction.created_at,
    updatedAt: dbTransaction.updated_at,
    metadata: dbTransaction.metadata,
    errorMessage: dbTransaction.error_message ?? undefined,
    errorCode: dbTransaction.error_code ?? undefined,
    lastPaymentError: dbTransaction.last_payment_error
  }
} 