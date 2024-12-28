import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

const stripe = new Stripe(stripeSecretKey);

async function fetchStripeArtists() {
  try {
    const accounts = await stripe.accounts.list({
      limit: 100
    });

    console.log('Found Stripe connected accounts:', accounts.data.length);
    
    // Print detailed information for each account
    accounts.data.forEach((account, index) => {
      console.log(`\nArtist ${index + 1}:`);
      console.log('Account ID:', account.id);
      console.log('Email:', account.email);
      console.log('Business Name:', account.business_profile?.name);
      console.log('Display Name:', account.settings?.dashboard?.display_name);
      console.log('Payouts Enabled:', account.payouts_enabled);
      console.log('Charges Enabled:', account.charges_enabled);
      if (account.created) {
        console.log('Created:', new Date(account.created * 1000).toISOString());
      }
      console.log('Details Submitted:', account.details_submitted);
      
      // Print business profile if available
      if (account.business_profile) {
        console.log('Business Profile:', {
          url: account.business_profile.url,
          mcc: account.business_profile.mcc,
          product_description: account.business_profile.product_description
        });
      }
    });

  } catch (error) {
    console.error('Error fetching Stripe accounts:', error);
  }
}

fetchStripeArtists(); 