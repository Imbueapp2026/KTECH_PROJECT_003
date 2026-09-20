import { Metadata } from 'next';
import CollectionsClient from './CollectionsClient';

export const metadata: Metadata = {
  title: 'All Collections | Avirat Jewelers',
  description: 'Explore our complete catalogue of handcrafted gold and silver fine jewelry pieces.',
};

export default function CollectionsPage() {
  return <CollectionsClient />;
}
