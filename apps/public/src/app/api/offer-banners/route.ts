import { getAnonClient } from "@/lib/supabase";
import { serverError } from "@/lib/http";
import { isOfferCurrentlyActive } from "@/lib/offers";

export async function GET() {
  const { data, error } = await getAnonClient()
    .from("offer_banners")
    .select("id, offer_id, image_url, alt_text, display_order, product_id, offers!inner(is_active, start_date, end_date)")
    .eq("is_active", true)
    .eq("offers.is_active", true)
    .order("display_order", { ascending: true });

  if (error) return serverError(error);
  const activeBanners = (data ?? []).filter((banner) => {
    const offer = Array.isArray(banner.offers) ? banner.offers[0] : banner.offers;
    return !!offer && isOfferCurrentlyActive(offer);
  });
  return Response.json({ data: activeBanners }, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}