/**
 * GET /api/gold-price — public endpoint for current gold price
 * Returns the current gold price per gram with comparison data
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
    
    // Get the most recent gold price
    const { data, error } = await supabase
      .from('gold_prices')
      .select('price_per_gram, updated_at, source')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error || !data) {
      // Return fallback price if no data available
      const response = Response.json({
        price_per_gram: 6500,
        updated_at: new Date().toISOString(),
        source: 'fallback'
      }, {
        headers: { 'Cache-Control': 'no-store' }
      });
      return withCors(response, req, { origin: '*' });
    }
    
    // Get previous price for comparison
    const { data: previousData } = await supabase
      .from('gold_prices')
      .select('price_per_gram')
      .order('updated_at', { ascending: false })
      .limit(1)
      .range(1, 1);
    
    const previous_price = previousData?.[0]?.price_per_gram;
    const price_decrease_percent = previous_price && data.price_per_gram < previous_price
      ? ((previous_price - data.price_per_gram) / previous_price) * 100
      : null;

    const response = Response.json({
      price_per_gram: data.price_per_gram,
      updated_at: data.updated_at,
      source: data.source,
      previous_price: previous_price,
      price_decrease_percent: price_decrease_percent
    }, {
      headers: { 'Cache-Control': 'no-store' }
    });
    return withCors(response, req, { origin: '*' });
  } catch (err) {
    console.error("Gold price API error:", err);
    const errorResponse = serverError("Failed to fetch gold price");
    return withCors(errorResponse, req, { origin: '*' });
  }
}
