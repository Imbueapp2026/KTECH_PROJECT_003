/**
 * Shared TypeScript types for Avirat Jewelers
 * Source of truth: Database schema in supabase/migrations/
 * These types should match the database schema exactly
 */

// Enums
export type Availability = "available" | "made_to_order" | "sold";
export type ProductStatus = "draft" | "published" | "archived";
export type InquiryStatus = "new" | "contacted" | "resolved";
export type DiscountType = "percentage" | "flat";

// Database table types
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon_url: string | null;
  icon_svg: string | null;
  sort_order: number;
  is_system: boolean;
  created_at: string;
}

export interface Offer {
  id: string;
  label: string;
  description: string | null;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Discount {
  id: string;
  offer_id: string;
  discount_type: DiscountType;
  value: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  description: string;
  hallmark_certified: boolean;
  availability: Availability;
  price: number;
  offer_id: string | null;
  status: ProductStatus;
  image_urls: string[];
  created_at: string;
  updated_at: string;
  purity_carats?: number | null;
  weight_grams?: number | null;
  net_weight_grams?: number | null;
  making_charge_percent?: number | null;
  making_charge_flat?: number | null;
  making_charge_type?: 'percent' | 'flat' | null;
  certifications?: string | null;
  gold_price_used?: number | null;
  price_auto_calculated?: boolean;
  gst_percent?: number | null;
  material_type?: 'gold' | 'silver' | null;
  festival_id?: string | null;
}

export interface Festival {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  date: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  product_id: string | null;
  source_page: string | null;
  status: InquiryStatus;
  created_at: string;
}

export interface Visit {
  id: string;
  page_path: string;
  product_id: string | null;
  created_at: string;
}

// Joined types for API responses
export type OfferWithDiscounts = Offer & { discounts: Discount[] };

export type ProductWithCategory = Product & {
  category: Category | null;
};

export type ProductWithOffer = Product & {
  offer: (OfferWithDiscounts & { discount: Discount | null }) | null;
};

export type ProductJoined = Product & {
  category: Category | null;
  offer: (OfferWithDiscounts & { discount: Discount | null }) | null;
};

export type InquiryWithProduct = Inquiry & {
  product: Product | null;
};
