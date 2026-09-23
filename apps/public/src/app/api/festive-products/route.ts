/**
 * GET /api/festive-products — Get festive/featured products for festival collection
 * Returns festival products plus products with active offers when a festival is active
 */
import { getAnonClient } from "@/lib/supabase";
import { serverError } from "@/lib/http";
import { handlePreflight, withCors } from "@/lib/cors";

export async function GET(req: Request) {
  // Handle preflight request
  const preflight = handlePreflight(req, { origin: '*' });
  if (preflight) return preflight;
  
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "5");
    
    const supabase = getAnonClient();
    
    // First, get the active festival
    const { data: activeFestival, error: festivalError } = await supabase
      .from("festivals")
      .select("id, name, description, image_url")
      .eq("is_active", true)
      .single();
    
    if (festivalError || !activeFestival) {
      // No active festival, return empty array
      const response = Response.json({ data: [], festival: null }, {
        headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' }
      });
      return withCors(response, req, { origin: '*' });
    }
    
    // The active festival collection also highlights products with active offers.
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
        offers(id, label, is_active)
      `)
      .or(`festival_id.eq.${activeFestival.id},offer_id.not.is.null`)
      .eq("status", "published")
      .order("updated_at", { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('[API] GET /api/festive-products query error:', error);
      const errorResponse = serverError("Failed to fetch festive products");
      return withCors(errorResponse, req, { origin: '*' });
    }
    
    // Transform response to match expected type (categories -> category) and add source flag
    const transformedData = data?.map((item: Record<string, unknown>) => ({
      ...item,
      category: Array.isArray(item.categories) ? item.categories[0] : item.categories || null,
      offer: Array.isArray(item.offers) ? item.offers[0] : item.offers || null,
      categories: undefined,
      offers: undefined,
      source: item.festival_id === activeFestival.id ? 'festival' : 'offer',
    })) || [];
    
    const response = Response.json({ data: transformedData, festival: activeFestival }, {
      headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' }
    });
    return withCors(response, req, { origin: '*' });
  } catch (error) {
    console.error('[API] GET /api/festive-products error:', error);
    const errorResponse = serverError(error instanceof Error ? error.message : 'Unknown error');
    return withCors(errorResponse, req, { origin: '*' });
  }
}
