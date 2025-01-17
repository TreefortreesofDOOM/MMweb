import { 
  GhostProfile, 
  StripeTransaction, 
  DbGhostProfile, 
  DbTransaction,
  PaymentStatus 
} from '@/lib/types/ghost-profiles-types'

// Conversion utilities
export function toGhostProfile(dbProfile: DbGhostProfile): GhostProfile {
  return {
    id: dbProfile.id,
    email: dbProfile.email,
    stripeCustomerId: dbProfile.stripe_customer_id ?? '',
    isClaimed: dbProfile.is_claimed ?? false,
    displayName: dbProfile.display_name ?? '',
    createdAt: dbProfile.created_at ?? '',
    updatedAt: dbProfile.updated_at ?? '',
    lastPurchaseDate: dbProfile.last_purchase_date,
    totalPurchases: dbProfile.total_purchases ?? 0,
    totalSpent: dbProfile.total_spent ?? 0,
    isVisible: dbProfile.is_visible ?? false,
    claimedProfileId: dbProfile.claimed_profile_id,
    metadata: dbProfile.metadata as { [key: string]: any; isTest?: boolean; environment?: string }
  }
}

export function toTransaction(dbTransaction: DbTransaction): StripeTransaction {
  return {
    id: dbTransaction.id ?? '',
    artworkId: dbTransaction.artwork_id ?? '',
    buyerId: dbTransaction.buyer_id ?? undefined,
    ghostProfileId: dbTransaction.ghost_profile_id ?? undefined,
    stripePaymentIntentId: dbTransaction.stripe_payment_intent_id ?? '',
    stripeCustomerId: dbTransaction.ghost_profile_id ?? '',
    amount: dbTransaction.amount_total ?? 0,
    amountReceived: dbTransaction.amount_received ?? undefined,
    currency: 'usd',
    paymentStatus: dbTransaction.status as PaymentStatus ?? 'canceled',
    paymentIntentStatus: dbTransaction.payment_intent_status ?? '',
    captureMethod: dbTransaction.capture_method ?? undefined,
    confirmationMethod: dbTransaction.confirmation_method ?? undefined,
    description: dbTransaction.description ?? undefined,
    invoiceId: dbTransaction.invoice_id ?? undefined,
    statementDescriptor: dbTransaction.statement_descriptor ?? undefined,
    statementDescriptorSuffix: dbTransaction.statement_descriptor_suffix ?? undefined,
    paymentMethodId: dbTransaction.payment_method_id ?? undefined,
    paymentMethodTypes: dbTransaction.payment_method_types ?? [],
    paymentMethodDetails: dbTransaction.payment_method_details as {
      type: string;
      card?: {
        brand: string;
        last4: string;
        expMonth: number;
        expYear: number;
        country: string;
      };
    } ?? undefined,
    stripeCreated: dbTransaction.stripe_created ?? '',
    stripeCanceledAt: dbTransaction.stripe_canceled_at ?? undefined,
    stripeProcessingAt: dbTransaction.stripe_processing_at ?? undefined,
    stripeSucceededAt: dbTransaction.stripe_succeeded_at ?? undefined,
    createdAt: dbTransaction.created_at ?? '',
    updatedAt: dbTransaction.updated_at ?? '',
    metadata: dbTransaction.metadata as { [key: string]: any; isTest?: boolean; environment?: string } ?? {},
    errorMessage: dbTransaction.error_message ?? undefined,
    errorCode: dbTransaction.error_code ?? undefined,
    lastPaymentError: dbTransaction.last_payment_error ?? undefined
  }
} 