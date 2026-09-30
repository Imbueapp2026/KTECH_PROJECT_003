import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAnonClient } from '@/lib/supabase';
import { ProductDetailView } from './ProductDetailView';
import type { ProductJoined } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string): Promise<ProductJoined | null> {
  const supabase = getAnonClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      description,
      price,
      image_urls,
      availability,
      hallmark_certified,
      status,
      category_id,
      offer_id,
      created_at,
      updated_at,
      purity_carats,
      weight_grams,
      net_weight_grams,
      making_charge_percent,
      making_charge_flat,
      making_charge_type,
      price_auto_calculated,
      certifications,
      gold_price_used,
      material_type,
      gst_percent,
      festival_id,
      categories (id, name, slug, icon_svg),
      offers (id, label, description, is_active, start_date, end_date, discounts(discount_type, value))
    `)
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (error || !data) return null;

  const category = Array.isArray(data.categories) ? data.categories[0] : data.categories;
  const offerRaw = Array.isArray(data.offers) && data.offers.length > 0 ? (data.offers[0] as Record<string, unknown>) : null;
  let offer = null;
  if (offerRaw) {
    const { discounts, ...restOffer } = offerRaw;
    offer = {
      ...restOffer,
      discount: Array.isArray(discounts) && discounts.length > 0 ? discounts[0] : null
    };
  }

  const restData = { ...(data as Record<string, unknown>) };
  delete restData.categories;
  delete restData.offers;

  return {
    ...restData,
    category: category || null,
    offer,
  } as unknown as ProductJoined;
}

async function getRelatedProducts(categoryId: string, currentProductId: string): Promise<ProductJoined[]> {
  const supabase = getAnonClient();
  const { data } = await supabase
    .from("products")
    .select(`
      id,
      name,
      description,
      price,
      image_urls,
      availability,
      hallmark_certified,
      status,
      category_id,
      offer_id,
      created_at,
      updated_at,
      purity_carats,
      weight_grams,
      net_weight_grams,
      making_charge_percent,
      making_charge_flat,
      making_charge_type,
      price_auto_calculated,
      certifications,
      gold_price_used,
      material_type,
      gst_percent,
      festival_id,
      categories (id, name, slug, icon_svg),
      offers (id, label, description, is_active, start_date, end_date, discounts(discount_type, value))
    `)
    .eq("category_id", categoryId)
    .eq("status", "published")
    .neq("id", currentProductId)
    .order("created_at", { ascending: false })
    .limit(8);

  return (data || []).map((p) => {
    const category = Array.isArray(p.categories) ? p.categories[0] : p.categories;
    const offerRaw = Array.isArray(p.offers) && p.offers.length > 0 ? (p.offers[0] as Record<string, unknown>) : null;
    let offer = null;
    if (offerRaw) {
      const { discounts, ...restOffer } = offerRaw;
      offer = {
        ...restOffer,
        discount: Array.isArray(discounts) && discounts.length > 0 ? discounts[0] : null
      };
    }
    const restData = { ...(p as Record<string, unknown>) };
    delete restData.categories;
    delete restData.offers;
    return {
      ...restData,
      category: category || null,
      offer,
    } as unknown as ProductJoined;
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Product Not Found | Avirat Jewelers',
      description: 'The requested jewelry item could not be found.',
    };
  }

  const title = `${product.name} | Avirat Jewelers`;
  const description = product.description
    ? product.description.slice(0, 160)
    : `Explore ${product.name} crafted in ${product.material_type || 'precious metal'} by Avirat Jewelers.`;
  const images = product.image_urls && product.image_urls.length > 0 ? [product.image_urls[0]] : [];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = product.category_id
    ? await getRelatedProducts(product.category_id, product.id)
    : [];

  return <ProductDetailView product={product} relatedProducts={relatedProducts} />;
}
