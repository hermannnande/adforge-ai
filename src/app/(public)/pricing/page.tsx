import type { Metadata } from 'next';
import { PricingCards } from '@/components/marketing/pricing-cards';
import { FaqSection } from '@/components/marketing/faq-section';
import { CtaSection } from '@/components/marketing/cta-section';

export const metadata: Metadata = { title: 'Tarifs' };

export default function PricingPage() {
  return (
    <>
      <PricingCards />
      <FaqSection />
      <CtaSection />
    </>
  );
}
