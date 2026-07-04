// ─────────────────────────────────────────────────────────────────────────────
// Local bundled assets — downloaded from Unsplash, stored in assets/images/
// React Native requires static require() paths, so each entry is explicit.
// ─────────────────────────────────────────────────────────────────────────────

// Category images (local)
export const CATEGORY_IMAGES: Record<string, any> = {
  Men: require("@/assets/images/categories/men.jpg"),
  Women: require("@/assets/images/categories/women.jpg"),
  Kids: require("@/assets/images/categories/kids.jpg"),
  Beauty: require("@/assets/images/categories/beauty.jpg"),
};

// Product images — primary + secondary images, keyed by exact product name
// Each product has [primary, secondary, tertiary] local assets
export const PRODUCT_IMAGES: Record<string, any[]> = {
  "Casual White T-Shirt": [
    require("@/assets/images/products/white-tshirt.jpg"),
    require("@/assets/images/products/white-tshirt-2.jpg"),
  ],
  "Denim Jacket": [
    require("@/assets/images/products/denim-jacket.jpg"),
    require("@/assets/images/products/denim-jacket-2.jpg"),
  ],
  "Summer Dress": [
    require("@/assets/images/products/summer-dress.jpg"),
    require("@/assets/images/products/summer-dress-2.jpg"),
  ],
  "Classic Sneakers": [
    require("@/assets/images/products/sneakers.jpg"),
    require("@/assets/images/products/sneakers-2.jpg"),
  ],
  "Oxford Button-Up Shirt": [
    require("@/assets/images/products/oxford-shirt.jpg"),
    require("@/assets/images/products/oxford-shirt-2.jpg"),
  ],
  "Slim Fit Jeans": [
    require("@/assets/images/products/slim-jeans.jpg"),
    require("@/assets/images/products/slim-jeans-2.jpg"),
  ],
  "Running Shorts": [
    require("@/assets/images/products/running-shorts.jpg"),
    require("@/assets/images/products/running-shorts-2.jpg"),
  ],
  "Elegant Saree": [
    require("@/assets/images/products/saree.jpg"),
    require("@/assets/images/products/saree-2.jpg"),
  ],
  "Casual Crop Top": [
    require("@/assets/images/products/crop-top.jpg"),
    require("@/assets/images/products/crop-top-2.jpg"),
  ],
  "Yoga Pants": [
    require("@/assets/images/products/yoga-pants.jpg"),
    require("@/assets/images/products/yoga-pants-2.jpg"),
  ],
  "Printed Kurti": [
    require("@/assets/images/products/kurti.jpg"),
    require("@/assets/images/products/kurti-2.jpg"),
  ],
  "Kids T-Shirt": [
    require("@/assets/images/products/kids-tshirt.jpg"),
    require("@/assets/images/products/kids-tshirt-2.jpg"),
  ],
  "Girls Frock": [
    require("@/assets/images/products/girls-frock.jpg"),
    require("@/assets/images/products/girls-frock-2.jpg"),
  ],
  "BB Cream": [
    require("@/assets/images/products/bb-cream.jpg"),
    require("@/assets/images/products/bb-cream-2.jpg"),
  ],
  "Lipstick Matte": [
    require("@/assets/images/products/lipstick.jpg"),
    require("@/assets/images/products/lipstick-2.jpg"),
  ],
  "Facial Serum": [
    require("@/assets/images/products/serum.jpg"),
    require("@/assets/images/products/serum-2.jpg"),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Fallback: Unsplash URLs by category (used when local asset or DB URL missing)
// ─────────────────────────────────────────────────────────────────────────────
const FALLBACK_URLS: Record<string, string[]> = {
  Men: [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1596217957745-b1e842dad7e3?w=500&auto=format&fit=crop",
  ],
  Women: [
    "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1585399361357-d4fbb0bef60f?w=500&auto=format&fit=crop",
  ],
  Kids: [
    "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1545862332-197b745caea3?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1588215457850-cb6bcc3b8f5c?w=500&auto=format&fit=crop",
  ],
  Footwear: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&auto=format&fit=crop",
  ],
  Accessories: [
    "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop",
  ],
  Beauty: [
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1630656741375-b036157bb191?w=500&auto=format&fit=crop",
  ],
};

const GENERIC_FALLBACK =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop";

// ─────────────────────────────────────────────────────────────────────────────
// getLocalCategoryImage — returns a local bundled require() asset or undefined
// ─────────────────────────────────────────────────────────────────────────────
export function getLocalCategoryImage(name: string): any | undefined {
  return CATEGORY_IMAGES[name] ?? undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// getProductImageSource — returns {uri} or require() depending on availability
// Use this for <Image source={getProductImageSource(...)} />
// ─────────────────────────────────────────────────────────────────────────────
export function getProductImageSource(
  productName?: string,
  images?: string[] | null,
  category?: string,
  productId?: string | number
): { uri: string } | number {
  // 1. Try local bundled asset (best: offline, no network dependency)
  if (productName && PRODUCT_IMAGES[productName]) {
    return PRODUCT_IMAGES[productName][0];
  }

  // 2. Try DB image URL (Supabase-stored Unsplash URL)
  if (Array.isArray(images) && images.length > 0 && images[0]) {
    return { uri: images[0] };
  }

  // 3. Use category-specific Unsplash fallback
  if (category && FALLBACK_URLS[category]) {
    const fallbacks = FALLBACK_URLS[category];
    const idx = productId ? Number(productId) % fallbacks.length : 0;
    return { uri: fallbacks[isNaN(idx) ? 0 : idx] };
  }

  // 4. Generic fallback
  return { uri: GENERIC_FALLBACK };
}

// ─────────────────────────────────────────────────────────────────────────────
// getProductImageUrl — legacy helper: returns a URI string
// (used in screens that still do source={{ uri: ... }})
// ─────────────────────────────────────────────────────────────────────────────
export function getProductImageUrl(
  images: string[] | undefined | null,
  category?: string,
  productId?: string | number
): string {
  if (Array.isArray(images) && images.length > 0 && images[0]) {
    return images[0];
  }
  if (category && FALLBACK_URLS[category]) {
    const fallbacks = FALLBACK_URLS[category];
    const idx = productId ? Number(productId) % fallbacks.length : 0;
    return fallbacks[isNaN(idx) ? 0 : idx];
  }
  return GENERIC_FALLBACK;
}

// ─────────────────────────────────────────────────────────────────────────────
// getCarouselImages — returns array of image sources for product detail carousel
// ─────────────────────────────────────────────────────────────────────────────
export function getCarouselImages(
  images: string[] | undefined | null,
  category?: string,
  productName?: string
): Array<{ uri: string } | number> {
  // 1. Local assets first (multiple angles)
  if (productName && PRODUCT_IMAGES[productName]) {
    return PRODUCT_IMAGES[productName];
  }

  // 2. DB images
  if (Array.isArray(images) && images.length > 0) {
    return images.filter(Boolean).map((img) => ({ uri: img }));
  }

  // 3. Category fallback URLs
  if (category && FALLBACK_URLS[category]) {
    return FALLBACK_URLS[category].map((url) => ({ uri: url }));
  }

  return [{ uri: GENERIC_FALLBACK }];
}
