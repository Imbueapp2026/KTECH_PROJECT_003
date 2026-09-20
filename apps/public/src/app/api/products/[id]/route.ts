/**
 * GET /api/products/[id] — public read-only endpoint for single product
 * Returns a published product with category and offer information.
 */
import { getAnonClient } from "@/lib/supabase";
import { notFound, serverError } from "@/lib/http";
import { handlePreflight, withCors } from "@/lib/cors";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Handle preflight request
  const preflight = handlePreflight(req, { origin: '*' });
  if (preflight) return preflight;

  try {
    const { id } = await params;
    const supabase = getAnonClient();

    const { data, error } = await supabase
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
        created_at,
        updated_at,
        purity_carats,
        weight_grams,
        net_weight_grams,
        making_charge_percent,
        making_charge_flat,
        making_charge_type,
        price_auto_calculated,
        certifications,
        gold_price_used,
        material_type,
        gst_percent,
        festival_id,
        categories (id, name, slug, icon_svg),
        offers (id, label, description, is_active, start_date, end_date, discounts(discount_type, value))
      `)
      .eq("id", id)
      .eq("status", "published")
      .single();

    if (error) {
      console.error("Product query error:", error);
      if (error.code === "PGRST116") {
        const errorResponse = notFound("Product not found");
        return withCors(errorResponse, req, { origin: '*' });
      }
      const errorResponse = serverError("Failed to fetch product");
      return withCors(errorResponse, req, { origin: '*' });
    }

    // Transform response to match expected type
    const offerRaw = Array.isArray(data.offers) && data.offers.length > 0 ? (data.offers[0] as Record<string, unknown>) : null;
    let offer = null;
    if (offerRaw) {
      const { discounts, ...restOffer } = offerRaw;
      offer = {
        ...restOffer,
        discount: Array.isArray(discounts) && discounts.length > 0 ? discounts[0] : null
      };
    }

    const { categories: _categories, offers: _offers, ...restData } = data as Record<string, unknown>;

    const transformedData = {
      ...restData,
      category: Array.isArray(data.categories) ? data.categories[0] : data.categories || null,
      offer,
    };

    const response = Response.json({ data: transformedData }, {
      headers: { 'Cache-Control': 'no-store' }
    });
    return withCors(response, req, { origin: '*' });
  } catch (err) {
    console.error("Unexpected error:", err);
    const errorResponse = serverError("Unexpected error");
    return withCors(errorResponse, req, { origin: '*' });
  }
}