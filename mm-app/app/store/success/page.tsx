import { stripe } from '@/lib/stripe/stripe-server-utils';
import { CheckoutStatus } from '@/components/store/checkout-status';

interface Props {
  searchParams: { session_id?: string }
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    return <CheckoutStatus status="error" message="No session ID provided" />;
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return <CheckoutStatus status="error" message="Payment not completed" />;
    }

    return <CheckoutStatus status="success" />;
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    return <CheckoutStatus status="error" />;
  }
} 