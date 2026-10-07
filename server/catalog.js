const ORIGIN = "https://snazzyfits.in";
export function normalizeProduct(p) {
  const minor = 10 ** p.prices.currency_minor_unit;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name.replace(/&#8217;/g, "’"),
    url: p.permalink,
    image: p.images[0]?.src,
    price: Number(p.prices.price) / minor,
    regularPrice: Number(p.prices.regular_price) / minor,
    currency: p.prices.currency_code,
    rating: Number(p.average_rating),
    reviewCount: p.review_count,
    inStock: p.is_in_stock,
    type: p.type,
    attributes: p.attributes,
    categories: p.categories,
    description: p.short_description || p.description,
  };
}
export async function getCatalog() {
  const r = await fetch(`${ORIGIN}/wp-json/wc/store/v1/products?per_page=100`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) throw new Error("Catalog unavailable");
  return (await r.json()).map(normalizeProduct);
}
