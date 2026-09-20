/**
 * POST /api/visits — public endpoint for visit tracking
 * Allows anonymous users to submit visit tracking data for analytics.
 */
import { getAnonClient } from "@/lib/supabase";
import { badRequest, serverError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { handlePreflight, withCors } from "@/lib/cors";

export async function POST(req: Request) {
  // Handle preflight request
  const preflight = handlePreflight(req, { origin: '*' });
  if (preflight) return preflight;

  // Rate limit: 60 visit tracking events per minute per IP
  const rateLimitResponse = await rateLimit(req, 60, 60000);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await req.json();
    const { page_path, product_id } = body;

    if (!page_path || typeof page_path !== "string" || page_path.trim().length === 0) {
      const errorResponse = badRequest("page_path is required");
      return withCors(errorResponse, req, { origin: '*' });
    }

    const supabase = getAnonClient();

    const { data, error } = await supabase
      .from("visits")
      .insert({
        page_path: page_path.trim(),
        product_id: product_id || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Visits insert error:", error);
      const errorResponse = serverError("Failed to track visit");
      return withCors(errorResponse, req, { origin: '*' });
    }

    const response = Response.json({ data }, { status: 201 });
    return withCors(response, req, { origin: '*' });
  } catch (err) {
    console.error("Visits unexpected error:", err);
    const errorResponse = serverError("Unexpected error");
    return withCors(errorResponse, req, { origin: '*' });
  }
}
