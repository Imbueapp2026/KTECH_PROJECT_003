/**
 * GET    /api/admin/products/[id]   — single product with category + offer join
 * PATCH  /api/admin/products/[id]   — partial update
 * DELETE /api/admin/products/[id]   — soft delete (status='archived')
 */
import { requireAdmin } from "@/lib/firebase-admin";
import { getServiceClient } from "@/lib/supabase";
import {
  badRequest,
  notFound,
  parseJson,
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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin(_req))) return unauthorized();
  const { id } = await params;
  if (!asUuid(id)) return badRequest("invalid id");
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, category_id, description, hallmark_certified, availability, price, offer_id, status, image_urls, created_at, updated_at, purity_carats, weight_grams, making_charge_percent, making_charge_flat, making_charge_type, price_auto_calculated, certifications, gold_price_used, category:categories(id, name, slug, icon_svg)",
    )
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === "PGRST116") return notFound();
    return serverError(error);
  }
  return Response.json({ data });
}

interface ProductPatch {
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin(req))) return unauthorized();
  const { id } = await params;
  if (!asUuid(id)) return badRequest("invalid id");
  const body = (await parseJson<ProductPatch>(req)) ?? {};
  
  console.log("PATCH product request:", { id, body });

  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) {
    const v = asString(body.name, 200);
    if (!v) return badRequest("name invalid");
    patch.name = v;
  }
  if (body.category_id !== undefined) {
    const v = asUuid(body.category_id);
    if (!v) return badRequest("category_id invalid");
    patch.category_id = v;
  }
  if (body.description !== undefined) {
    const v = asString(body.description, 5000);
    if (!v) return badRequest("description invalid");
    patch.description = v;
  }
  if (body.hallmark_certified !== undefined) {
    const v = asBool(body.hallmark_certified);
    if (v === null) return badRequest("hallmark_certified must be boolean");
    patch.hallmark_certified = v;
  }
  if (body.availability !== undefined) {
    const v = asEnum<Availability>(body.availability, AVAILABILITY);
    if (!v) return badRequest("availability invalid");
    patch.availability = v;
  }
  // Price is no longer directly settable - it's always calculated server-side
  if (body.price !== undefined) {
    // Ignore direct price updates - price is always calculated from gold pricing fields
  }
  if (body.offer_id !== undefined) {
    patch.offer_id = body.offer_id == null ? null : asUuid(body.offer_id);
  }
  if (body.status !== undefined) {
    const v = asEnum<ProductStatus>(body.status, STATUS);
    if (!v) return badRequest("status invalid");
    patch.status = v;
  }
  if (body.image_urls !== undefined) {
    if (!Array.isArray(body.image_urls)) return badRequest("image_urls must be array");
    patch.image_urls = body.image_urls
      .filter((u): u is string => typeof u === "string" && u.length > 0)
      .slice(0, 4);
  }
  
  // Gold pricing fields
  if (body.purity_carats !== undefined) {
    // Accept both string and number for purity_carats
    let v: string | undefined;
    if (typeof body.purity_carats === 'number') {
      v = body.purity_carats.toString();
    } else {
      const enumResult = asEnum(body.purity_carats, PURITY_CARATS);
      v = enumResult || undefined;
    }
    if (!v || !PURITY_CARATS.includes(v as any)) return badRequest("purity_carats invalid");
    patch.purity_carats = parseInt(v, 10);
  }
  if (body.weight_grams !== undefined) {
    const v = asNumber(body.weight_grams);
    if (v != null && v <= 0) return badRequest("weight_grams must be positive");
    patch.weight_grams = v;
  }
  if (body.making_charge_percent !== undefined) {
    const v = asNumber(body.making_charge_percent);
    if (v != null && v < 0) return badRequest("making_charge_percent must be non-negative");
    patch.making_charge_percent = v;
  }
  if (body.making_charge_flat !== undefined) {
    const v = asNumber(body.making_charge_flat);
    if (v != null && v < 0) return badRequest("making_charge_flat must be non-negative");
    patch.making_charge_flat = v;
  }
  if (body.making_charge_type !== undefined) {
    const v = asEnum(body.making_charge_type, MAKING_CHARGE_TYPE);
    if (!v) return badRequest("making_charge_type invalid");
    patch.making_charge_type = v;
  }
  // price_auto_calculated is always true now
  if (body.price_auto_calculated !== undefined) {
    // Ignore this field - it's always true
  }
  if (body.certifications !== undefined) {
    const v = asString(body.certifications, 500);
    patch.certifications = v;
  }
  if (body.gold_price_used !== undefined) {
    const v = asNumber(body.gold_price_used);
    if (v == null) return badRequest("gold_price_used must be a number");
    if (v !== null && v <= 0) return badRequest("gold_price_used must be positive");
    patch.gold_price_used = v;
  }
  
  console.log("Patch object:", patch);
  
  // Fetch current product to get existing values
  const supabase = getServiceClient();
  const { data: currentProduct } = await supabase
    .from("products")
    .select("purity_carats, weight_grams, making_charge_percent, making_charge_flat, making_charge_type, gold_price_used")
    .eq("id", id)
    .single();
  
  if (!currentProduct) return notFound();
  
  // Always recalculate price if product has required gold pricing fields
  const purity = (patch.purity_carats ?? currentProduct.purity_carats) as 24 | 22 | 18 | 14 | 9 | null;
  const weight = patch.weight_grams ?? currentProduct.weight_grams;
  const makingType = (patch.making_charge_type ?? currentProduct.making_charge_type) as "percent" | "flat" | null;
  const makingPercent = patch.making_charge_percent ?? currentProduct.making_charge_percent;
  const makingFlat = patch.making_charge_flat ?? currentProduct.making_charge_flat;
  
  // Fetch current gold price from database
  const { data: goldPriceData } = await supabase
    .from("gold_prices")
    .select("price_per_gram")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  
  const currentGoldPrice = goldPriceData?.price_per_gram;
  
  // Only recalculate if all required fields are present
  if (purity && weight && makingType && currentGoldPrice) {
    const makingCharge = makingType === 'percent' ? makingPercent : makingFlat;
    
    // Validate required fields
    if (weight <= 0) {
      return badRequest("weight_grams must be positive");
    }
    if (currentGoldPrice <= 0) {
      return badRequest("gold_price_used must be positive");
    }
    if (makingType === 'percent' && (makingCharge == null || makingCharge < 0)) {
      return badRequest("making_charge_percent is required and must be non-negative for percent-based making charge");
    }
    if (makingType === 'flat' && (makingCharge == null || makingCharge < 0)) {
      return badRequest("making_charge_flat is required and must be non-negative for flat making charge");
    }
    
    patch.price = calculateGoldPrice({
      goldPricePerGram: currentGoldPrice,
      purityCarats: purity,
      weightGrams: weight,
      makingCharge: makingCharge!,
      makingChargeType: makingType,
    });
    patch.gold_price_used = currentGoldPrice;
    patch.price_auto_calculated = true;
  }
  
  patch.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("products")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    if (error.code === "PGRST116") return notFound();
    return serverError(error);
  }
  return Response.json({ data });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin(req))) return unauthorized();
  const { id } = await params;
  if (!asUuid(id)) return badRequest("invalid id");

  // Soft delete — preserve inquiry history.
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("products")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, status")
    .single();
  if (error) {
    if (error.code === "PGRST116") return notFound();
    return serverError(error);
  }
  return Response.json({ data });
}