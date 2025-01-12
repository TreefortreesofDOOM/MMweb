import { createClient } from '@/lib/supabase/supabase-server';
import { stripe } from '@/lib/stripe/stripe-server-utils';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Input validation schema
const createProductSchema = z.object({
  artwork_id: z.string().uuid(),
  is_variable_price: z.boolean().default(false),
  min_price: z.number().optional(),
  is_limited_edition: z.boolean().default(false),
  edition_size: z.number().optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createProductSchema.parse(body);
    
    // Get artwork details
    const { data: artwork, error: artworkError } = await supabase
      .from('artworks')
      .select('*')
      .eq('id', validatedData.artwork_id)
      .eq('artist_id', user.id)
      .single();

    if (artworkError || !artwork) {
      return new NextResponse('Artwork not found or unauthorized', { status: 404 });
    }

    // Get artist's Stripe account and store settings
    const { data: storeSettings, error: settingsError } = await supabase
      .from('store_settings')
      .select('stripe_account_id, application_fee_percent')
      .eq('profile_id', user.id)
      .single();

    if (settingsError || !storeSettings?.stripe_account_id) {
      return new NextResponse('Stripe account not found', { status: 400 });
    }

    // Create Stripe product (owned by platform)
    const product = await stripe.products.create({
      name: artwork.title,
      description: artwork.description || undefined,
      images: artwork.images.map((img: any) => img.url),
      metadata: {
        artwork_id: artwork.id,
        artist_id: user.id,
        platform_product: 'true', // Mark as platform-owned
        connected_account: storeSettings.stripe_account_id,
        ...(validatedData.is_limited_edition && {
          limited_edition: 'true',
          edition_size: validatedData.edition_size?.toString(),
          inventory: validatedData.edition_size?.toString(),
          inventory_status: 'in_stock'
        })
      }
    });

    // Create price (owned by platform)
    const price = await stripe.prices.create({
      product: product.id,
      currency: 'usd',
      ...(validatedData.is_variable_price ? {
        custom_unit_amount: {
          enabled: true,
          minimum: validatedData.min_price ? validatedData.min_price * 100 : 1000, // Minimum $10
        }
      } : {
        unit_amount: artwork.price * 100,
      })
    });

    // Create payment link with checkout session configuration
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{
        price: price.id,
        quantity: 1,
        adjustable_quantity: validatedData.is_limited_edition ? {
          enabled: true,
          minimum: 1,
          maximum: validatedData.edition_size || 1,
        } : undefined,
      }],
      after_completion: { 
        type: 'redirect', 
        redirect: { 
          url: `${process.env.NEXT_PUBLIC_APP_URL}/store/success?session_id={CHECKOUT_SESSION_ID}` 
        }
      },
      payment_method_types: ['card'],
      application_fee_percent: storeSettings.application_fee_percent,
      transfer_data: {
        destination: storeSettings.stripe_account_id,
      },
      custom_text: {
        submit: { message: 'By purchasing, you agree to our terms of service' }
      }
    });

    // Create store product in database
    const { data: storeProduct, error: storeError } = await supabase
      .rpc('create_store_product', {
        _profile_id: user.id,
        _artwork_id: artwork.id,
        _stripe_product_id: product.id,
        _stripe_price_id: price.id,
        _payment_link: paymentLink.url,
        _stripe_product_metadata: product.metadata,
        _is_variable_price: validatedData.is_variable_price,
        _min_price: validatedData.min_price
      });

    if (storeError) {
      // Cleanup Stripe resources on error
      await stripe.products.del(product.id);
      return new NextResponse('Failed to create store product', { status: 500 });
    }

    return NextResponse.json(storeProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    return new NextResponse(
      error instanceof z.ZodError 
        ? 'Invalid request data' 
        : 'Internal server error',
      { status: error instanceof z.ZodError ? 400 : 500 }
    );
  }
} 