/**
 * GET /api/categories — public read-only endpoint for categories
 * Returns all categories with product counts.
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

    const { data, error } = await supabase
      .from("categories")
      .select(`
        id,
        name,
        slug,
        icon_svg,
        created_at,
        products (id)
      `)
      .order("name");

    if (error) {
      console.error("Categories query error:", error);
      return serverError("Failed to fetch categories");
    }

    const categoriesWithCount = (data || []).map(
      (cat: { products?: Array<unknown> } & Record<string, unknown>) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon_svg: cat.icon_svg,
        product_count: Array.isArray(cat.products) ? cat.products.length : 0,
      })
    );

    const response = Response.json({ data: categoriesWithCount }, {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' }
    });
    return withCors(response, req, { origin: '*' });
  } catch (err) {
    console.error("Unexpected error:", err);
    const errorResponse = serverError("Unexpected error");
    return withCors(errorResponse, req, { origin: '*' });
  }
}
