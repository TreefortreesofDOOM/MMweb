'use server';

import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { GalleryWallType } from '@/lib/types/gallery-types';
import { stripe } from '@/lib/stripe/stripe-server-utils';

interface UpdateProductPriceData {
  artworkId: string;
  wallType: GalleryWallType;
  isVariablePrice: boolean;
  minPrice?: number;
  recommendedPrice?: number;
  galleryPrice?: number;
}

export async function updateProductPrice(data: UpdateProductPriceData) {
  const supabase = createServiceRoleClient();

  // Get the store product
  const { data: product, error: productError } = await supabase
    .from('store_products')
    .select('id, stripe_product_id, payment_link_id, payment_link_status')
    .eq('artwork_id', data.artworkId)
    .single();

  // If product doesn't exist, create it
  if (productError?.code === 'PGRST116') {
    // Get artwork details for Stripe product
    const { data: artwork } = await supabase
      .from('artworks')
      .select('title, description, artist_id')
      .eq('id', data.artworkId)
      .single();

    if (!artwork) throw new Error('Artwork not found');

    // Create Stripe product
    const stripeProduct = await stripe.products.create({
      name: artwork.title,
      description: artwork.description || undefined,
      metadata: {
        artwork_id: data.artworkId,
        artist_id: artwork.artist_id,
        wall_type: data.wallType,
        is_variable_price: data.isVariablePrice.toString(),
        min_price: data.minPrice?.toString() || null,
        recommended_price: data.recommendedPrice?.toString() || null
      }
    });

    // Create store product
    const { data: newProduct, error: createError } = await supabase
      .from('store_products')
      .insert({
        artwork_id: data.artworkId,
        profile_id: artwork.artist_id,
        stripe_product_id: stripeProduct.id,
        is_variable_price: data.isVariablePrice,
        min_price: data.minPrice || null,
        metadata: {
          wall_type: data.wallType,
          recommended_price: data.recommendedPrice || null
        },
        status: 'active'
      })
      .select()
      .single();

    if (createError) throw createError;
    return { success: true };
  }

  if (productError) throw productError;

  // Update store product
  const { error: updateError } = await supabase
    .from('store_products')
    .update({
      is_variable_price: data.isVariablePrice,
      min_price: data.minPrice || null,
      metadata: {
        wall_type: data.wallType,
        recommended_price: data.recommendedPrice || null
      }
    })
    .eq('id', product.id);

  if (updateError) throw updateError;

  // Update Stripe product metadata
  if (product.stripe_product_id) {
    await stripe.products.update(product.stripe_product_id, {
      metadata: {
        wall_type: data.wallType,
        is_variable_price: data.isVariablePrice.toString(),
        min_price: data.minPrice?.toString() || null,
        recommended_price: data.recommendedPrice?.toString() || null
      }
    });

    // Update or create price in Stripe
    if (!data.isVariablePrice && data.galleryPrice) {
      const amount = Math.round(data.galleryPrice * 100); // Convert to cents
      const price = await stripe.prices.create({
        product: product.stripe_product_id,
        unit_amount: amount,
        currency: 'usd',
        active: true
      });

      // If there's an existing payment link, archive it
      if (product.payment_link_id && product.payment_link_status === 'active') {
        await stripe.paymentLinks.update(product.payment_link_id, {
          active: false
        });

        // Update payment link status in database
        await supabase
          .from('store_products')
          .update({
            payment_link_status: 'archived'
          })
          .eq('id', product.id);
      }

      // Create new payment link with updated price
      const { data: storeSettings } = await supabase
        .from('store_settings')
        .select('application_fee_percent, stripe_account_id')
        .single();

      if (storeSettings?.stripe_account_id) {
        const paymentLink = await stripe.paymentLinks.create({
          line_items: [{
            price: price.id,
            quantity: 1
          }],
          application_fee_percent: storeSettings.application_fee_percent,
          transfer_data: {
            destination: storeSettings.stripe_account_id
          },
          metadata: {
            artwork_id: data.artworkId
          }
        });

        // Update store product with new payment link ID
        await supabase
          .from('store_products')
          .update({
            payment_link_id: paymentLink.id,
            payment_link_status: 'active'
          })
          .eq('id', product.id);
      }
    }
  }

  return { success: true };
} 