/**
 * GET /api/active-festival — Get the currently active festival
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
    
    // First try to get manually active festival
    const { data: manualActive, error: manualError } = await supabase
      .from("festivals")
      .select("*")
      .eq("is_active", true)
      .single();
    
    if (!manualError && manualActive) {
      // Check if the manually active festival is within its date range
      const now = new Date();
      const startDate = manualActive.start_date ? new Date(manualActive.start_date) : null;
      const endDate = manualActive.end_date ? new Date(manualActive.end_date) : null;
      
      const isWithinRange = 
        (!startDate || now >= startDate) && 
        (!endDate || now <= endDate);
      
      if (isWithinRange) {
        const response = Response.json({ data: manualActive }, {
          headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' }
        });
        return withCors(response, req, { origin: '*' });
      }
    }
    
    // If no manually active festival or outside date range, try to find one based on date range
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("festivals")
      .select("*")
      .or(`start_date.lte.${now},start_date.is.null`)
      .or(`end_date.gte.${now},end_date.is.null`)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      // No active festival is not an error, just return null
      const response = Response.json({ data: null }, {
        headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' }
      });
      return withCors(response, req, { origin: '*' });
    }
    
    const response = Response.json({ data }, {
      headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' }
    });
    return withCors(response, req, { origin: '*' });
  } catch (error) {
    console.error('[API] GET /api/active-festival error:', error);
    const errorResponse = serverError(error instanceof Error ? error.message : 'Unknown error');
    return withCors(errorResponse, req, { origin: '*' });
  }
}
