import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { MODELS, getModel } from '../../data/models';

export function generateStaticParams() {
  return MODELS.map((model) => ({ model: model.slug }));
}

async function ModelCheck({ params }: { params: Promise<{ model: string }> }) {
  const { model } = await params;
  if (!getModel(model)) notFound();
  return null;
}

export default function ModelPage({
  params,
}: {
  params: Promise<{ model: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <ModelCheck params={params} />
    </Suspense>
  );
}
