import { getAnonClient } from "@/lib/supabase";
import { serverError } from "@/lib/http";
import { handlePreflight, withCors } from "@/lib/cors";

type CatalogProduct = {
  id: string;
  name: string;
  price: number;
  image_urls: string[] | null;
  created_at: string;
};

type PriceBand = {
  minPrice: number;
  maxPrice: number | null;
  label: string;
  product: CatalogProduct | null;
};

function formatPrice(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function roundBandStep(value: number) {
  const magnitude = 10 ** Math.max(0, Math.floor(Math.log10(Math.max(value, 1))));
  const normalized = value / magnitude;
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return niceNormalized * magnitude;
}

function buildBands(minPrice: number, maxPrice: number, products: CatalogProduct[]): PriceBand[] {
  if (minPrice === maxPrice) {
    return [{
      minPrice,
      maxPrice: null,
      label: `From ${formatPrice(minPrice)}`,
      product: products[0] ?? null,
    }];
  }

  const rawStep = (maxPrice - minPrice) / 4;
  const step = roundBandStep(rawStep);
  const start = Math.floor(minPrice / step) * step;

  return Array.from({ length: 4 }, (_, index) => {
    const bandMin = start + index * step;
    const bandMax = index === 3 ? null : bandMin + step;
    const matchingProducts = products
      .filter((product) => product.price >= bandMin && (bandMax === null ? true : product.price < bandMax))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return {
      minPrice: bandMin,
      maxPrice: bandMax,
      label: index === 0
        ? `Under ${formatPrice(bandMax ?? bandMin)}`
        : bandMax === null
          ? `Above ${formatPrice(bandMin)}`
          : `${formatPrice(bandMin)}–${formatPrice(bandMax)}`,
      product: matchingProducts[0] ?? null,
    };
  });
}

export async function GET(req: Request) {
  const preflight = handlePreflight(req, { origin: "*" });
  if (preflight) return preflight;

  const { data, error } = await getAnonClient()
    .from("products")
    .select("id, name, price, image_urls, created_at")
    .eq("status", "published")
    .neq("availability", "sold")
    .order("created_at", { ascending: false });

  if (error) return withCors(serverError("Failed to fetch price bands"), req, { origin: "*" });

  const products = (data ?? []) as CatalogProduct[];
  if (products.length === 0) {
    return withCors(Response.json({ data: [] }), req, { origin: "*" });
  }

  const prices = products.map((product) => product.price);
  const bands = buildBands(Math.min(...prices), Math.max(...prices), products);
  return withCors(Response.json({ data: bands }), req, { origin: "*" });
}
