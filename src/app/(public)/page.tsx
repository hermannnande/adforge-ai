import { Hero } from '@/components/marketing/hero';
import { LogoMarquee } from '@/components/marketing/logo-marquee';
import { SocialProof } from '@/components/marketing/social-proof';
import { ProductShowcase } from '@/components/marketing/product-showcase';
import { BeforeAfter } from '@/components/marketing/before-after';
import { BentoFeatures } from '@/components/marketing/bento-features';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { VideoSection } from '@/components/marketing/video-section';
import { Gallery } from '@/components/marketing/gallery';
import { UseCases } from '@/components/marketing/use-cases';
import { PricingCards } from '@/components/marketing/pricing-cards';
import { FaqSection } from '@/components/marketing/faq-section';
import { CtaSection } from '@/components/marketing/cta-section';

export default function HomePage() {
  return (
    <>
      <Hero />
      <LogoMarquee />
      <SocialProof />
      <ProductShowcase />
      <BeforeAfter />
      <BentoFeatures />
      <HowItWorks />
      <VideoSection />
      <Gallery />
      <UseCases />
      <PricingCards />
      <FaqSection />
      <CtaSection />
    </>
  );
}
