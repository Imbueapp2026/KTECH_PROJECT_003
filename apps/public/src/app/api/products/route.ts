/**
 * GET /api/products — public read-only endpoint for products
 * Returns published products with category and offer information.
 * Supports category filter, offer filter, price sorting, and pagination.
 */
import { getAnonClient } from "@/lib/supabase";
import { badRequest, serverError } from "@/lib/http";
import { handlePreflight, withCors } from "@/lib/cors";

export async function GET(req: Request) {
  // Handle preflight request
  const preflight = handlePreflight(req, { origin: '*' });
  if (preflight) return preflight;
  try {
    const url = new URL(req.url);
    const category_id = url.searchParams.get("category_id");
    const offer_id = url.searchParams.get("offer_id");
    const sort = url.searchParams.get("sort") || "created_at";
    const order = url.searchParams.get("order") || "desc";
    const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 100);
    const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0);

    // Validate sort parameter
    const validSortFields = ["created_at", "price", "name"];
    if (!validSortFields.includes(sort)) {
      return badRequest(`Invalid sort field. Must be one of: ${validSortFields.join(", ")}`);
    }

    // Validate order parameter
    if (order !== "asc" && order !== "desc") {
      return badRequest("Invalid order parameter. Must be 'asc' or 'desc'");
    }

    const supabase = getAnonClient();

    let query = supabase
      .from("products")
      .select(`
        id,
        name,
        description,
        price,
        image_urls,
        availability,
        hallmark_certified,
        status,
        category_id,
        offer_id,
        material_type,
        weight_grams,
        net_weight_grams,
        purity_carats,
        created_at,
        updated_at,
        categories (id, name, slug, icon_svg)
      `)
      .eq("status", "published")
      .neq("availability", "sold");

    // Apply category filter
    if (category_id) {
      query = query.eq("category_id", category_id);
    }

    // Apply offer filter
    if (offer_id) {
      query = query.eq("offer_id", offer_id);
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === "asc" });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error("Products query error:", error);
      return serverError("Failed to fetch products");
    }

    // Transform response to match expected type (categories -> category)
    const transformedData = data?.map((item: Record<string, unknown>) => ({
      ...item,
      category: Array.isArray(item.categories) ? item.categories[0] : item.categories || null,
      categories: undefined,
    })) || [];

    // Get total count for pagination
    let countQuery = supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .neq("availability", "sold");

    if (category_id) {
      countQuery = countQuery.eq("category_id", category_id);
    }

    if (offer_id) {
      countQuery = countQuery.eq("offer_id", offer_id);
    }

    const { count: totalCount } = await countQuery;

    const response = Response.json({
      data: transformedData,
      pagination: {
        limit,
        offset,
        total: totalCount || 0,
        hasMore: (offset + limit) < (totalCount || 0),
      },
    }, {
      headers: { 'Cache-Control': 'no-store' }
    });
    return withCors(response, req, { origin: '*' });
  } catch (err) {
    console.error("Unexpected error:", err);
    const errorResponse = serverError("Unexpected error");
    return withCors(errorResponse, req, { origin: '*' });
  }
}
