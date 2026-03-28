import type { Metadata } from 'next';
import { FaqSection } from '@/components/marketing/faq-section';
import { CtaSection } from '@/components/marketing/cta-section';

export const metadata: Metadata = { title: 'FAQ' };

export default function FaqPage() {
  return (
    <>
      <FaqSection />
      <CtaSection />
    </>
  );
}
