import { GET as getProductFeed } from '../product-feed.xml/route';

// A fresh, stable Merchant Center URL that bypasses any failed-fetch state
// cached against the original product-feed.xml source.
export const dynamic = 'force-dynamic';

export async function GET() {
  return getProductFeed();
}
