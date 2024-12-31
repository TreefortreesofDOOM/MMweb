import { stripe } from '@/lib/stripe/stripe-server-utils';
import { createClient } from '@/lib/supabase/supabase-server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  try {
    const { artworkId } = await request.json();

    const supabase = await createClient();
    const { data: artwork } = await supabase
      .from('artworks')
      .select('*')
      .eq('id', artworkId)
      .single();

    if (!artwork) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 });
    }

    // First create a product
    const product = await stripe.products.create({
      name: artwork.title,
      description: artwork.description || undefined,
      metadata: {
        artwork_id: artwork.id
      }
    });

    // Then create a price for the product
    const price = await stripe.prices.create({
      product: product.id,
      currency: 'usd',
      unit_amount: artwork.price * 100
    });

    // Finally create the payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{
        price: price.id,
        quantity: 1
      }],
      metadata: {
        artwork_id: artwork.id,
        artist_id: artwork.artist_id
      }
    });

    return NextResponse.json({ url: paymentLink.url });
  } catch (error) {
    console.error('Error creating payment link:', error);
    return NextResponse.json(
      { error: 'Failed to create payment link' },
      { status: 500 }
    );
  }
} 