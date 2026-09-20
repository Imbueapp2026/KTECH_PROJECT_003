/**
 * GET /api/banner — public endpoint for banner content
 * Returns a mix of latest products, featured categories, and limited products
 */
import { getAnonClient } from "@/lib/supabase";
import { serverError } from "@/lib/http";
import { handlePreflight, withCors } from "@/lib/cors";

export async function GET(req: Request) {
  // Handle preflight request
  const preflight = handlePreflight(req, { origin: '*' });
  if (preflight) return preflight;

  try {
    const supabase = getAnonClient();
    const items: Array<Record<string, unknown>> = [];

    // Get latest products (top 3)
    const { data: latestProducts } = await supabase
      .from("products")
      .select("id, name, image_urls, price, category_id")
      .eq("status", "published")
      .neq("availability", "sold")
      .order("created_at", { ascending: false })
      .limit(3);

    if (latestProducts) {
      latestProducts.forEach((product) => {
        items.push({
          id: product.id,
          type: "product",
          title: product.name,
          imageUrl: product.image_urls?.[0] || null,
          linkUrl: `/products/${product.id}`,
          badge: "New",
          data: product
        });
      });
    }

    // Get featured categories (top 2)
    const { data: featuredCategories } = await supabase
      .from("categories")
      .select("id, name, slug, icon_svg")
      .eq("is_featured", true)
      .order("banner_priority", { ascending: false })
      .limit(2);

    if (featuredCategories) {
      featuredCategories.forEach((category) => {
        items.push({
          id: category.id,
          type: "category",
          title: category.name,
          imageUrl: category.icon_svg || null,
          linkUrl: `/?category=${category.slug}`,
          badge: "Featured",
          data: category
        });
      });
    }

    // Get limited products (top 2)
    const { data: limitedProducts } = await supabase
      .from("products")
      .select("id, name, image_urls, price, category_id")
      .eq("status", "published")
      .eq("is_limited", true)
      .neq("availability", "sold")
      .order("banner_priority", { ascending: false })
      .limit(2);

    if (limitedProducts) {
      limitedProducts.forEach((product) => {
        items.push({
          id: product.id,
          type: "product",
          title: product.name,
          imageUrl: product.image_urls?.[0] || null,
          linkUrl: `/products/${product.id}`,
          badge: "Limited",
          data: product
        });
      });
    }

    const response = Response.json({ items: items.slice(0, 7) }, {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' }
    });
    return withCors(response, req, { origin: '*' });
  } catch (err) {
    console.error("Banner API error:", err);
    const errorResponse = serverError("Failed to fetch banner content");
    return withCors(errorResponse, req, { origin: '*' });
  }
}
