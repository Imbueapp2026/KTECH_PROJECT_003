import { Metadata } from 'next';
import { getAnonClient } from '@/lib/supabase';
import CategoryClient from './CategoryClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getAnonClient();
  
  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', slug)
    .single();

  if (!category) {
    return {
      title: 'Collection Not Found | Avirat Jewelers',
    };
  }

  const title = `${category.name} | Avirat Jewelers`;
  const description = category.description 
    ? category.description 
    : `Explore our ${category.name.toLowerCase()} collection of handcrafted fine jewelry pieces.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CategoryPage() {
  return <CategoryClient />;
}
