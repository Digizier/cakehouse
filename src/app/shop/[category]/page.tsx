import { INITIAL_CATEGORIES } from '@/lib/seedData';
import CategoryClientView from './CategoryClientView';

// Mandatory for Next.js output: 'export' static export
export function generateStaticParams() {
  return INITIAL_CATEGORIES.map((cat) => ({
    category: cat.slug,
  }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const resolvedParams = await params;
  return <CategoryClientView categorySlug={resolvedParams.category} />;
}
