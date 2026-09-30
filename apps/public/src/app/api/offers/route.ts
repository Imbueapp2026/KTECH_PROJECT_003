/**
 * GET /api/offers — Get offer-tagged products for standalone Offers section
 * Used when no active festival exists
 * Fetches data directly from admin-managed offers table for real-time updates
 */
import { getAnonClient } from "@/lib/supabase";
import { serverError } from "@/lib/http";
import { handlePreflight, withCors } from "@/lib/cors";
import { isOfferCurrentlyActive } from "@/lib/offers";

export async function GET(req: Request) {
  // Handle preflight request
  const preflight = handlePreflight(req, { origin: '*' });
  if (preflight) return preflight;
  
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "5");
    
    const supabase = getAnonClient();
    
    // Get products that have active offers from admin-managed offers table
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        category_id,
        description,
        hallmark_certified,
        availability,
        price,
        offer_id,
        status,
        image_urls,
        created_at,
        updated_at,
        purity_carats,
        weight_grams,
        making_charge_percent,
        making_charge_flat,
        making_charge_type,
        certifications,
        gold_price_used,
        gst_percent,
        material_type,
        festival_id,
        categories(id, name, slug),
        offers(id, label, is_active, start_date, end_date, discounts(id, discount_type, value))
      `)
      .not("offer_id", "is", null)
      .eq("status", "published")
      .eq("offers.is_active", true)
      .order("updated_at", { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('[API] GET /api/offers query error:', error);
      const errorResponse = serverError("Failed to fetch offer products");
      return withCors(errorResponse, req, { origin: '*' });
    }
    
    // Transform response to match expected type (categories -> category, offers -> offer)
    const transformedData = data?.map((item: Record<string, unknown>) => {
      const rawOffer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
      let offer: any = null;
      
      if (rawOffer && typeof rawOffer === "object") {
        const offerObj = rawOffer as Record<string, unknown>;
        if (isOfferCurrentlyActive({
          is_active: offerObj.is_active === true,
          start_date: typeof offerObj.start_date === "string" ? offerObj.start_date : null,
          end_date: typeof offerObj.end_date === "string" ? offerObj.end_date : null,
        })) {
          const discounts = Array.isArray(offerObj.discounts) ? offerObj.discounts : [];
          offer = {
            ...offerObj,
            discount: discounts[0] || null,
          };
        }
      }
      
      return {
        ...item,
        category: Array.isArray(item.categories) ? item.categories[0] : item.categories || null,
        offer,
        categories: undefined,
        offers: undefined,
        source: 'offer',
      };
    }).filter((item: Record<string, unknown>) => item.offer !== null) || [];
    
    const response = Response.json({ data: transformedData }, {
      headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' }
    });
    return withCors(response, req, { origin: '*' });
  } catch (error) {
    console.error('[API] GET /api/offers error:', error);
    const errorResponse = serverError(error instanceof Error ? error.message : 'Unknown error');
    return withCors(errorResponse, req, { origin: '*' });
  }
}