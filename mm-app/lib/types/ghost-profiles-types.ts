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