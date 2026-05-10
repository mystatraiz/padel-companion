import { MatchDetailView } from './MatchDetailView';

// Pre-render the default match IDs; user-added matches work via client-side nav
export function generateStaticParams() {
  return ['m1', 'm2', 'm3', 'm4', 'm5'].map((id) => ({ id }));
}

export const dynamicParams = false;

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MatchDetailView id={id} />;
}
