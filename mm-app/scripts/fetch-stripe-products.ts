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

const artistAccounts = [
  {
    name: 'Imani Dumas',
    account_id: 'acct_1QSJNRRJHKZex4RD'
  },
  {
    name: 'David Baerwalde',
    account_id: 'acct_1PifYxI3Y0rQmR6p'
  },
  {
    name: 'Michael Stasny',
    account_id: 'acct_1Paf2BIkr48ljqys',
    aliases: ['mike stasny', 'michael stasny']
  }
];

interface ProductInfo {
  product: Stripe.Product;
  price: Stripe.Price;
  transferData?: Stripe.Transfer;
}

async function fetchArtistProducts() {
  try {
    // Get all products
    const products = await stripe.products.list({
      limit: 100,
      active: true
    });

    console.log(`Found ${products.data.length} total products`);

    // Group products by artist
    const artistProducts = new Map<string, ProductInfo[]>();

    for (const product of products.data) {
      // Get the price for this product
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
        limit: 1
      });

      if (prices.data.length > 0) {
        const price = prices.data[0];
        
        // Get artist from metadata
        const artistMetadata = product.metadata?.artist?.toLowerCase();
        let matchedArtist = null;

        if (artistMetadata) {
          // Match by name (case insensitive) and check aliases for Mike Stasny
          matchedArtist = artistAccounts.find(a => {
            const artistName = a.name.toLowerCase();
            const aliases = a.aliases || [];
            return artistMetadata === artistName || 
                   artistMetadata === artistName.replace(' ', '') ||
                   artistMetadata.includes(artistName) ||
                   aliases.some(alias => artistMetadata.includes(alias));
          });
        }

        if (matchedArtist) {
          if (!artistProducts.has(matchedArtist.name)) {
            artistProducts.set(matchedArtist.name, []);
          }
          
          const productInfo: ProductInfo = {
            product,
            price,
          };
          
          artistProducts.get(matchedArtist.name)?.push(productInfo);
        }
      }
    }

    // Print results for each artist
    artistProducts.forEach((products, artistName) => {
      console.log(`\n${artistName}'s Products:`);
      console.log(`Found ${products.length} products`);

      products.forEach((item, index) => {
        console.log(`\nProduct ${index + 1}:`);
        console.log('Name:', item.product.name);
        console.log('Description:', item.product.description);
        console.log('Price:', item.price ? `$${item.price.unit_amount! / 100}` : 'N/A');
        console.log('Images:', item.product.images);
        console.log('Product Metadata:', item.product.metadata);
        console.log('Price Metadata:', item.price.metadata);
      });
    });

  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

async function main() {
  try {
    await fetchArtistProducts();
  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  }
}

main(); 