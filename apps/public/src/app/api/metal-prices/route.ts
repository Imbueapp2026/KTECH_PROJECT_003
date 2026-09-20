/**
 * GET /api/metal-prices — public combined endpoint for current gold and silver prices
 * Returns current rates with metadata and comparison data in a single request.
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
    
    // 1. Fetch current Gold Price
    const { data: goldData } = await supabase
      .from('gold_prices')
      .select('price_per_gram, updated_at, source')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 2. Fetch previous Gold Price for comparison
    const { data: previousGoldData } = await supabase
      .from('gold_prices')
      .select('price_per_gram')
      .order('updated_at', { ascending: false })
      .limit(1)
      .range(1, 1);

    // 3. Fetch current Silver Price
    const { data: silverData } = await supabase
      .from('silver_prices')
      .select('price_per_gram, updated_at, source')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 4. Fetch previous Silver Price for comparison
    const { data: previousSilverData } = await supabase
      .from('silver_prices')
      .select('price_per_gram')
      .order('updated_at', { ascending: false })
      .limit(1)
      .range(1, 1);

    const gold_price_per_gram = goldData?.price_per_gram || 6500;
    const gold_previous = previousGoldData?.[0]?.price_per_gram;
    const gold_price_decrease_percent = gold_previous && gold_price_per_gram < gold_previous
      ? ((gold_previous - gold_price_per_gram) / gold_previous) * 100
      : null;

    const silver_price_per_gram = silverData?.price_per_gram || 90;
    const silver_previous = previousSilverData?.[0]?.price_per_gram;
    const silver_price_decrease_percent = silver_previous && silver_price_per_gram < silver_previous
      ? ((silver_previous - silver_price_per_gram) / silver_previous) * 100
      : null;

    const response = Response.json({
      gold: {
        price_per_gram: gold_price_per_gram,
        updated_at: goldData?.updated_at || new Date().toISOString(),
        source: goldData?.source || 'fallback',
        previous_price: gold_previous,
        price_decrease_percent: gold_price_decrease_percent
      },
      silver: {
        price_per_gram: silver_price_per_gram,
        updated_at: silverData?.updated_at || new Date().toISOString(),
        source: silverData?.source || 'fallback',
        previous_price: silver_previous,
        price_decrease_percent: silver_price_decrease_percent
      }
    }, {
      headers: { 'Cache-Control': 'no-store' }
    });
    
    return withCors(response, req, { origin: '*' });
  } catch (err) {
    console.error("Metal prices combined API error:", err);
    const errorResponse = serverError("Failed to fetch metal prices");
    return withCors(errorResponse, req, { origin: '*' });
  }
}
