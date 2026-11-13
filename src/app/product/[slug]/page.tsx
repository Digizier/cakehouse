import { INITIAL_PRODUCTS } from '@/lib/seedData';
import ProductDetailClientView from './ProductDetailClientView';

// Mandatory for Next.js output: 'export'
export function generateStaticParams() {
  return INITIAL_PRODUCTS.map((prod) => ({
    slug: prod.slug,
  }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  return <ProductDetailClientView slug={resolvedParams.slug} />;
}
