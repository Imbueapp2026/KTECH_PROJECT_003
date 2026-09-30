/**
 * Types for the public app.
 * Replaces external shared-types package with clean local definitions.
 */

export type Availability = "available" | "made_to_order" | "sold";

export type ProductStatus = "draft" | "published" | "archived";

export type InquiryStatus = "new" | "contacted" | "resolved";

export type DiscountType = "percentage" | "flat";

export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order?: number;
  icon_svg?: string | null;
  is_system?: boolean;
  created_at?: string;
}

export interface Discount {
  id?: string;
  offer_id?: string;
  discount_type: DiscountType;
  value: number;
}

export interface Offer {
  id: string;
  label: string;
  description: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at?: string;
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
  created_at?: string;
  updated_at?: string;
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
  is_new?: boolean;
  status: ProductStatus;
  image_urls: string[];
  created_at: string;
  updated_at: string;
  purity_carats?: number | null;
  weight_grams?: number | null;
  net_weight_grams?: number | null;
  making_charge_percent?: number | null;
  making_charge_flat?: number | null;
  making_charge_type?: "percent" | "flat" | null;
  certifications?: string[] | string | null;
  gold_price_used?: number | null;
  price_auto_calculated?: boolean;
  gst_percent?: number | null;
  material_type?: "gold" | "silver" | null;
  festival_id?: string | null;
}

export type OfferWithDiscounts = Offer & {
  discount?: Discount | null;
  discounts?: Discount[];
};

export type ProductJoined = Product & {
  category: Category | null;
  offer?: OfferWithDiscounts | null;
};

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
