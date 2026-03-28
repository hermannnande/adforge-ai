import type { CreativeBrief } from './brief-analyzer';
import type { CreativeSuggestion } from './creative-strategist';

export interface PromptComposition {
  prompt: string;
  negativePrompt: string;
  style: string;
}

interface ComposeOptions {
  brief: CreativeBrief;
  suggestion: CreativeSuggestion;
  platform?: string;
  brandKit?: {
    primaryColors: string[];
    secondaryColors: string[];
    fonts: string[];
    tone?: string | null;
  };
  qualityMode: 'draft' | 'standard' | 'premium';
}

const PLATFORM_HINTS: Record<string, string> = {
  facebook: 'social media advertisement, Facebook ad format, clean layout with clear CTA',
  instagram: 'Instagram post, visually striking, mobile-first design, social media aesthetic',
  instagram_story: 'Instagram Story format, vertical composition, bold text overlay, eye-catching',
  tiktok: 'TikTok ad, vibrant colors, dynamic feel, youth-oriented, vertical format',
  whatsapp: 'WhatsApp Status image, simple and clear, mobile viewing',
  banner: 'web banner advertisement, horizontal composition, professional',
  flyer: 'print flyer design, high resolution, professional layout, print-ready',
};

const QUALITY_MODIFIERS: Record<ComposeOptions['qualityMode'], string> = {
  draft: 'quick concept sketch, simple composition',
  standard: 'professional quality, polished design, commercial photography',
  premium: 'ultra-high quality, 8K, masterful composition, award-winning advertising photography, studio lighting, photorealistic',
};

export function composePrompt(options: ComposeOptions): PromptComposition {
  const { brief, suggestion, platform, brandKit, qualityMode } = options;

  const parts: string[] = [];

  parts.push(suggestion.visualConcept);

  if (brief.productName) {
    parts.push(`featuring ${brief.productName}`);
  }
  if (brief.productCategory) {
    parts.push(`${brief.productCategory} product advertisement`);
  }

  parts.push(`headline text "${suggestion.headline}"`);
  if (suggestion.cta) {
    parts.push(`call-to-action "${suggestion.cta}"`);
  }

  parts.push(suggestion.colorMood);

  if (brandKit) {
    if (brandKit.primaryColors.length > 0) {
      parts.push(`using brand colors: ${brandKit.primaryColors.join(', ')}`);
    }
    if (brandKit.tone) {
      parts.push(`${brandKit.tone} brand tone`);
    }
  }

  const platformKey =
    (platform ?? brief.platform ?? '').toLowerCase().replace(/\s+/g, '_') || '';
  const platformHint = PLATFORM_HINTS[platformKey];
  if (platformHint) {
    parts.push(platformHint);
  }

  parts.push(QUALITY_MODIFIERS[qualityMode]);

  const style = brief.style ?? suggestion.colorMood;

  const negativePrompt = [
    'blurry',
    'low quality',
    'distorted text',
    'watermark',
    'signature',
    'deformed',
    'ugly',
    'duplicate',
    'morbid',
    'mutilated',
    'poorly drawn',
    'bad anatomy',
    'bad proportions',
    'extra limbs',
    'cloned face',
    'disfigured',
    'gross proportions',
    'nsfw',
    'nude',
    'violent',
    'gore',
  ].join(', ');

  return {
    prompt: parts.join(', '),
    negativePrompt,
    style,
  };
}
