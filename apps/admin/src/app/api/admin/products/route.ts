/**
 * GET  /api/admin/products       — list (filterable by status, category_id, q)
 * POST /api/admin/products       — create (draft until image upload completes)
 */
import { requireAdmin } from "@/lib/firebase-admin";
import { getServiceClient } from "@/lib/supabase";
import {
  badRequest,
  parseJson,
  parsePagination,
  serverError,
  unauthorized,
  asBool,
  asEnum,
  asNumber,
  asString,
  asUuid,
} from "@/lib/http";
import { calculateGoldPrice } from "@/lib/pricing";
import type { Availability, ProductStatus } from "@/lib/data/types";

const AVAILABILITY = ["available", "made_to_order", "sold"] as const;
const STATUS = ["draft", "published", "archived"] as const;
const PURITY_CARATS = ["24", "22", "18", "14", "9"] as const;
const MAKING_CHARGE_TYPE = ["percent", "flat"] as const;

export async function GET(req: Request) {
  try {
    if (!(await requireAdmin(req))) return unauthorized();
    const url = new URL(req.url);
    const { page, limit, offset } = parsePagination(url);
    const status = asEnum<ProductStatus>(
      url.searchParams.get("status"),
      STATUS,
    );
    const categoryId = asUuid(url.searchParams.get("category_id"));
    const q = asString(url.searchParams.get("q"), 100);

    const supabase = getServiceClient();
    let query = supabase
      .from("products")
      .select(
        "id, name, category_id, description, hallmark_certified, availability, price, offer_id, status, image_urls, created_at, updated_at, purity_carats, weight_grams, making_charge_percent, making_charge_flat, making_charge_type, price_auto_calculated, certifications, gold_price_used, categories(id, name, slug)",
        { count: "exact" },
      )
      .order("updated_at", { ascending: false });
    if (status) query = query.eq("status", status);
    if (categoryId) query = query.eq("category_id", categoryId);
    if (q) query = query.ilike("name", `%${q}%`);
    const { data, error, count } = await query.range(offset, offset + limit - 1);
    if (error) return serverError(error);
    return Response.json({ data, pagination: { page, limit, total: count || 0 } });
  } catch (error) {
    console.error('[API] GET /api/admin/products error:', error);
    return serverError(error instanceof Error ? error.message : 'Unknown error');
  }
}

interface ProductBody {
  name?: unknown;
  category_id?: unknown;
  description?: unknown;
  hallmark_certified?: unknown;
  availability?: unknown;
  price?: unknown;
  offer_id?: unknown;
  status?: unknown;
  image_urls?: unknown;
  // Gold pricing fields
  purity_carats?: unknown;
  weight_grams?: unknown;
  making_charge_percent?: unknown;
  making_charge_flat?: unknown;
  making_charge_type?: unknown;
  price_auto_calculated?: unknown;
  certifications?: unknown;
  gold_price_used?: unknown;
}

export async function POST(req: Request) {
  if (!(await requireAdmin(req))) return unauthorized();
  const body = (await parseJson<ProductBody>(req)) ?? {};
  const name = asString(body.name, 200);
  const category_id = asUuid(body.category_id);
  const description = asString(body.description, 5000);
  const hallmark_certified = asBool(body.hallmark_certified) ?? false;
  const availability = (asEnum<Availability>(body.availability, AVAILABILITY) ??
    "available") as Availability;
  const offer_id = body.offer_id == null ? null : asUuid(body.offer_id);
  const status = asEnum<ProductStatus>(body.status, STATUS) ?? "draft";
  const image_urls = Array.isArray(body.image_urls)
    ? body.image_urls
        .filter((u): u is string => typeof u === "string" && u.length > 0)
        .slice(0, 4)
    : [];

  // Gold pricing fields - now required
  // Accept both string and number for purity_carats
  let purity_carats_str: string | undefined;
  if (typeof body.purity_carats === 'number') {
    purity_carats_str = body.purity_carats.toString();
  } else {
    const enumResult = asEnum(body.purity_carats, PURITY_CARATS);
    purity_carats_str = enumResult || undefined;
  }
  if (!purity_carats_str || !PURITY_CARATS.includes(purity_carats_str as any)) return badRequest("purity_carats is required");
  const purity_carats = parseInt(purity_carats_str, 10) as 24 | 22 | 18 | 14 | 9;
  const weight_grams = asNumber(body.weight_grams);
  if (weight_grams == null || weight_grams <= 0) return badRequest("weight_grams is required and must be positive");
  const making_charge_percent = asNumber(body.making_charge_percent);
  const making_charge_flat = asNumber(body.making_charge_flat);
  const making_charge_type = asEnum(body.making_charge_type, MAKING_CHARGE_TYPE);
  if (!making_charge_type) return badRequest("making_charge_type is required");
  const certifications = asString(body.certifications, 500) ?? null;
  const gold_price_used = asNumber(body.gold_price_used);
  if (gold_price_used == null || gold_price_used <= 0) return badRequest("gold_price_used is required and must be positive");

  // Validation
  if (!name) return badRequest("name is required");
  if (!description) return badRequest("description is required");
  if (making_charge_type === 'percent' && (making_charge_percent == null || making_charge_percent < 0)) {
    return badRequest("making_charge_percent is required and must be non-negative for percent-based making charge");
  }
  if (making_charge_type === 'flat' && (making_charge_flat == null || making_charge_flat < 0)) {
    return badRequest("making_charge_flat is required and must be non-negative for flat making charge");
  }
  
  // Fetch current gold price from database
  const supabase = getServiceClient();
  const { data: goldPriceData } = await supabase
    .from("gold_prices")
    .select("price_per_gram")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  
  const currentGoldPrice = goldPriceData?.price_per_gram;
  
  if (!currentGoldPrice || currentGoldPrice <= 0) {
    return badRequest("Current gold price is not available or invalid. Please set a gold price first.");
  }
  
  // Always calculate price server-side using current gold price
  const makingCharge = making_charge_type === 'percent' ? making_charge_percent : making_charge_flat;
  const finalPrice = calculateGoldPrice({
    goldPricePerGram: currentGoldPrice,
    purityCarats: purity_carats,
    weightGrams: weight_grams,
    makingCharge: makingCharge!,
    makingChargeType: making_charge_type as 'percent' | 'flat',
  });

  const { data, error } = await supabase
    .from("products")
    .insert({
      name,
      category_id,
      description,
      hallmark_certified,
      availability,
      price: finalPrice,
      offer_id,
      status,
      image_urls,
      // Gold pricing fields
      purity_carats,
      weight_grams,
      making_charge_percent,
      making_charge_flat,
      making_charge_type,
      price_auto_calculated: true,
      certifications,
      gold_price_used: currentGoldPrice,
    })
    .select()
    .single();
  if (error) return serverError(error);
  return Response.json({ data }, { status: 201 });
}