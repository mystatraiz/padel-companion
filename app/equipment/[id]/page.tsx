import { EquipmentDetailView } from './EquipmentDetailView';

// Pre-render the default equipment IDs; user-added items work via client-side nav
export function generateStaticParams() {
  return ['r1', 'r2', 's1', 's2'].map((id) => ({ id }));
}

export const dynamicParams = false;

export default async function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EquipmentDetailView id={id} />;
}
