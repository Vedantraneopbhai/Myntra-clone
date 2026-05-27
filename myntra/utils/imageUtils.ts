// Default fallback images by category
const FALLBACK_IMAGES: Record<string, string[]> = {
  Men: [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502674900100-6534db3f61d1?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1548584328-9de7c59d7dd6?w=500&auto=format&fit=crop",
  ],
  Women: [
    "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1595614174216-8ab12078511d?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1596807633874-4ca4b8e83688?w=500&auto=format&fit=crop",
  ],
  Kids: [
    "https://images.unsplash.com/photo-1539533057440-7814a62d53d1?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503252585149-71f3a1e8a734?w=500&auto=format&fit=crop",
  ],
  Footwear: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500&auto=format&fit=crop",
  ],
  Accessories: [
    "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop",
  ],
  Beauty: [
    "https://images.unsplash.com/photo-1596462502278-af242a95dc4d?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1630656741375-b036157bb191?w=500&auto=format&fit=crop",
  ],
};

const GENERIC_FALLBACK =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop";

/**
 * Get image URL with smart fallback logic
 * @param images - Array of image URLs from product
 * @param category - Product category for category-specific fallback
 * @param productId - Product ID for deterministic fallback selection
 * @returns Selected image URL
 */
export function getProductImageUrl(
  images: string[] | undefined | null,
  category?: string,
  productId?: string
): string {
  // If product has images, use the first one
  if (Array.isArray(images) && images.length > 0 && images[0]) {
    return images[0];
  }

  // Use category-specific fallback if available
  if (category && FALLBACK_IMAGES[category]) {
    const categoryFallbacks = FALLBACK_IMAGES[category];
    // Use productId to deterministically select from fallback images
    const index = productId ? parseInt(productId) % categoryFallbacks.length : 0;
    return categoryFallbacks[index];
  }

  // Fall back to generic image
  return GENERIC_FALLBACK;
}

/**
 * Get all carousel images for product detail view
 * @param images - Array of image URLs from product
 * @param category - Product category for category-specific fallback
 * @returns Array of image URLs for carousel
 */
export function getCarouselImages(
  images: string[] | undefined | null,
  category?: string
): string[] {
  if (Array.isArray(images) && images.length > 0) {
    return images.filter((img) => !!img);
  }

  // Return fallback images for carousel
  if (category && FALLBACK_IMAGES[category]) {
    return FALLBACK_IMAGES[category];
  }

  return [GENERIC_FALLBACK];
}
