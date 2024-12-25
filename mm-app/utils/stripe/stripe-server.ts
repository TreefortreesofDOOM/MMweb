import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export const calculateFees = (basePrice: number) => {
  const platformCommissionRate = 0.50; // 50%
  const platformFee = Math.round(basePrice * platformCommissionRate);
  const artistAmount = basePrice - platformFee;

  return {
    platformFee,
    artistAmount,
    customerAmount: basePrice,
  };
}; 