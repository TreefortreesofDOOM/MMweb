import { createClient } from '@/lib/supabase/supabase-server';
import { stripe } from '@/lib/stripe/stripe-server-utils';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Input validation schema
const createProductSchema = z.object({
  artwork_id: z.string().uuid(),
  is_variable_price: z.boolean().default(false),
  min_price: z.number().optional(),
  price: z.number().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  inventory_type: z.enum(['unlimited', 'finite']).default('finite'),
  inventory_quantity: z.number().min(1, 'Quantity must be at least 1').default(1),
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
        limited_edition: validatedData.inventory_type === 'finite' ? 'true' : 'false',
        ...(validatedData.inventory_type === 'finite' ? {
          inventory: validatedData.inventory_quantity.toString(),
          inventory_status: 'in_stock'
        } : {})
      },
      shippable: true, // Since we're selling physical artwork
      statement_descriptor: 'Meaning Machine ART', // This will appear on credit card statements
    });

    // Create price (owned by platform)
    const price = await stripe.prices.create({
      product: product.id,
      currency: 'usd',
      ...(validatedData.is_variable_price ? {
        custom_unit_amount: {
          enabled: true,
          minimum: validatedData.min_price ? validatedData.min_price * 100 : 1000, // Minimum $10
          maximum: 100000000, // $1,000,000 maximum for art pieces
        }
      } : {
        unit_amount: validatedData.price ? validatedData.price * 100 : artwork.price * 100,
      }),
      tax_behavior: 'exclusive', // Tax will be calculated on top of this price
    });

    // Create payment link with checkout session configuration
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{
        price: price.id,
        quantity: 1,
        adjustable_quantity: validatedData.inventory_type === 'finite' ? {
          enabled: true,
          minimum: 1,
          maximum: validatedData.inventory_quantity,
        } : undefined,
      }],
      after_completion: { 
        type: 'redirect', 
        redirect: { 
          url: `${process.env.NEXT_PUBLIC_APP_URL}/store/success?session_id={CHECKOUT_SESSION_ID}` 
        }
      },
      automatic_tax: {
        enabled: true
      },
      shipping_address_collection: {
        allowed_countries: ['US'], // Restrict to US shipping for now
      },
      phone_number_collection: {
        enabled: true, // Collect phone for shipping updates
      },
      payment_method_types: ['card'],
      application_fee_percent: storeSettings.application_fee_percent,
      transfer_data: {
        destination: storeSettings.stripe_account_id,
      },
      custom_text: {
        submit: { message: 'By purchasing, you agree to our terms of service' },
        shipping_address: { message: 'Please provide a valid shipping address for artwork delivery' },
      },
      metadata: {
        artwork_id: artwork.id,
        artist_id: user.id,
        product_type: 'artwork',
        limited_edition: validatedData.inventory_type === 'finite' ? 'true' : 'false',
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
        _min_price: validatedData.min_price,
        _price: validatedData.price,
        _status: validatedData.status
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