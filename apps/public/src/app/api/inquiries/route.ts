/**
 * POST /api/inquiries — public endpoint for submitting inquiries
 * Allows anonymous users to submit product inquiries.
 * Email is optional per PRD §4.5
 * Rate limited to 5 requests per hour per IP
 */
import { getAnonClient } from "@/lib/supabase";
import { badRequest, serverError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { handlePreflight, withCors } from "@/lib/cors";

export async function POST(req: Request) {
  // Handle preflight request
  const preflight = handlePreflight(req, { origin: '*' });
  if (preflight) return preflight;
  // Rate limit: 5 inquiries per hour per IP
  const rateLimitResponse = await rateLimit(req, 5, 3600000); // 5 requests per hour
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await req.json();
    const { name, email, phone, message, product_id, source_page } = body;

    if (!name || !phone) {
      const errorResponse = badRequest("Name and phone are required");
      return withCors(errorResponse, req, { origin: '*' });
    }

    if (typeof name !== "string" || name.trim().length === 0) {
      const errorResponse = badRequest("Invalid name");
      return withCors(errorResponse, req, { origin: '*' });
    }

    if (email && (typeof email !== "string" || !email.includes("@"))) {
      const errorResponse = badRequest("Invalid email format");
      return withCors(errorResponse, req, { origin: '*' });
    }

    if (typeof phone !== "string" || phone.trim().length === 0) {
      const errorResponse = badRequest("Invalid phone");
      return withCors(errorResponse, req, { origin: '*' });
    }

    const supabase = getAnonClient();

    const { data, error } = await supabase
      .from("inquiries")
      .insert({
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone.trim(),
        message: message?.trim() || null,
        product_id: product_id || null,
        source_page: source_page || null,
        status: "new",
      })
      .select()
      .single();

    if (error) {
      console.error("Inquiry insert error:", error);
      const errorResponse = serverError("Failed to submit inquiry");
      return withCors(errorResponse, req, { origin: '*' });
    }

    const response = Response.json({ data }, { status: 201 });
    return withCors(response, req, { origin: '*' });
  } catch (err) {
    console.error("Unexpected error:", err);
    const errorResponse = serverError("Unexpected error");
    return withCors(errorResponse, req, { origin: '*' });
  }
}
