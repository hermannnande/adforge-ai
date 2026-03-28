import type { Metadata } from 'next';
import { Gallery } from '@/components/marketing/gallery';
import { UseCases } from '@/components/marketing/use-cases';
import { CtaSection } from '@/components/marketing/cta-section';

export const metadata: Metadata = { title: 'Exemples' };

export default function ExamplesPage() {
  return (
    <>
      <Gallery />
      <UseCases />
      <CtaSection />
    </>
  );
}
