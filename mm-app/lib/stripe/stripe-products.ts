import { stripe } from './stripe-server';

/**
 * Retrieves all products from Stripe with their prices
 * @returns Array of products with their associated prices
 */
export const getAllProducts = async () => {
  try {
    // Fetch all active products
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });

    // Fetch all prices for each product
    const productsWithPrices = await Promise.all(
      products.data.map(async (product) => {
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
        });

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          images: product.images,
          metadata: product.metadata,
          active: product.active,
          default_price: product.default_price,
          prices: prices.data,
        };
      })
    );

    return productsWithPrices;
  } catch (error) {
    console.error('Error fetching Stripe products:', error);
    throw error;
  }
};

/**
 * Retrieves a single product from Stripe with its prices
 * @param productId The Stripe product ID
 * @returns Product with its associated prices
 */
export const getProduct = async (productId: string) => {
  try {
    const product = await stripe.products.retrieve(productId, {
      expand: ['default_price'],
    });

    const prices = await stripe.prices.list({
      product: productId,
      active: true,
    });

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      images: product.images,
      metadata: product.metadata,
      active: product.active,
      default_price: product.default_price,
      prices: prices.data,
    };
  } catch (error) {
    console.error(`Error fetching Stripe product ${productId}:`, error);
    throw error;
  }
}; 