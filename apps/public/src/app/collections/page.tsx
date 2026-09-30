import { Metadata } from 'next';
import { Suspense } from 'react';
import CollectionsClient from './CollectionsClient';

export const metadata: Metadata = {
  title: 'All Collections | Avirat Jewelers',
  description: 'Explore our complete catalogue of handcrafted gold and silver fine jewelry pieces.',
};

export default function CollectionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 pt-20" />}>
      <CollectionsClient />
    </Suspense>
  );
}
