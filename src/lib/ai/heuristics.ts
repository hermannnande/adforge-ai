import { GenerationTaskType, TextRequirementMode } from './enums';

const PHOTOREALISM_RE =
  /photo\s*r[ée]al|ultra\s*r[ée]al|r[ée]aliste|photo\s*produit|product\s*photo|lifestyle|mise\s*en\s*sc[eè]ne|studio\s*lighting|packshot|shooting|tr[eè]s\s*r[ée]aliste|photo\s*pro|qualit[eé]\s*studio/i;

const TEXT_HEAVY_RE =
  /texte\s*(dans|sur|visible|lisible)|affiche\s*avec\s*texte|poster|slogan|miniature\s*branding|logo.*poster|text\s*in\s*image|headline.*visible|gros\s*texte|typo(graphi)?|branding.*texte/i;

const EXACT_TEXT_RE =
  /[ée]cris?\s*exactement|mets?\s*ce\s*texte|prix\s*\d|whatsapp\s*\+?\d|tel[:\s]*\+?\d|num[ée]ro|"[^"]{2,}"/i;

const MULTI_REF_RE =
  /plusieurs?\s*(r[ée]f[ée]ren|image|photo)|multi[- ]?r[ée]f|garder?\s*la\s*coh[ée]ren|same\s*product|m[eê]me\s*produit/i;

const PRODUCT_RE =
  /produit|product|packshot|shooting\s*produit|bottle|flacon|emballage|packaging/i;

const EDIT_RE =
  /modifie|retouche|change|remplace|edit|adjust|transform|enlève|supprime/i;

const BACKGROUND_RE =
  /fond|background|arri[eè]re[\s-]*plan|replace.*background|change.*fond/i;

const VERTICAL_RE = /story|stories|vertical|9.16|portrait/i;
const SQUARE_RE = /carr[ée]|square|1.1|1:1/i;

export function detectTaskType(prompt: string, referenceCount: number): GenerationTaskType {
  const p = prompt.toLowerCase();

  if (EDIT_RE.test(p) && BACKGROUND_RE.test(p)) return GenerationTaskType.BACKGROUND_REPLACE;
  if (EDIT_RE.test(p) && referenceCount >= 1) return GenerationTaskType.IMAGE_EDIT;
  if (referenceCount >= 2 && MULTI_REF_RE.test(p)) return GenerationTaskType.MULTI_REFERENCE_EDIT;

  if (TEXT_HEAVY_RE.test(p)) {
    if (/logo|brand|identit/i.test(p)) return GenerationTaskType.LOGO_LIKE_TEXT_VISUAL;
    return GenerationTaskType.POSTER_TEXT_HEAVY;
  }

  if (PHOTOREALISM_RE.test(p)) {
    if (PRODUCT_RE.test(p)) return GenerationTaskType.PRODUCT_SHOT;
    if (/lifestyle|mise\s*en\s*sc[eè]ne/i.test(p)) return GenerationTaskType.LIFESTYLE_SCENE;
    return GenerationTaskType.PHOTOREALISTIC_AD;
  }

  if (PRODUCT_RE.test(p)) return GenerationTaskType.PRODUCT_SHOT;

  if (VERTICAL_RE.test(p)) return GenerationTaskType.STORY_VERTICAL;
  if (SQUARE_RE.test(p)) return GenerationTaskType.SOCIAL_AD_SQUARE;

  return GenerationTaskType.GENERAL_AD_VISUAL;
}

export function detectTextRequirement(prompt: string): {
  mode: TextRequirementMode;
  level: 'low' | 'medium' | 'high';
  exactTexts: string[];
} {
  const exactTexts: string[] = [];

  const quoted = prompt.match(/"([^"]{2,})"/g);
  if (quoted) {
    for (const q of quoted) exactTexts.push(q.replace(/"/g, ''));
  }

  const priceMatch = prompt.match(/prix\s*[:=]?\s*([\d\s.,]+\s*(?:fcfa|€|xof|eur|\$|cfa)?)/gi);
  if (priceMatch) {
    for (const p of priceMatch) exactTexts.push(p.trim());
  }

  const phoneMatch = prompt.match(/(?:whatsapp|tel|t[ée]l[ée]phone|contact)\s*[:=]?\s*(\+?[\d\s.-]{7,})/gi);
  if (phoneMatch) {
    for (const p of phoneMatch) exactTexts.push(p.trim());
  }

  if (EXACT_TEXT_RE.test(prompt) || exactTexts.length > 0) {
    return { mode: TextRequirementMode.EXACT, level: 'high', exactTexts };
  }

  if (TEXT_HEAVY_RE.test(prompt)) {
    return { mode: TextRequirementMode.APPROXIMATE, level: 'medium', exactTexts: [] };
  }

  return { mode: TextRequirementMode.NONE, level: 'low', exactTexts: [] };
}

export function detectRealismLevel(prompt: string): 'low' | 'medium' | 'high' {
  if (PHOTOREALISM_RE.test(prompt)) return 'high';
  if (/illustration|cartoon|flat\s*design|dessin|sketch|art\s*num[ée]rique/i.test(prompt)) return 'low';
  return 'medium';
}

export function extractStyleIntent(prompt: string): string[] {
  const styles: string[] = [];
  const patterns: Array<[RegExp, string]> = [
    [/minimaliste|minimal/i, 'minimal'],
    [/luxe|luxury|premium/i, 'luxury'],
    [/moderne|modern/i, 'modern'],
    [/vintage|retro|r[ée]tro/i, 'vintage'],
    [/neon|n[ée]on|cyberpunk/i, 'neon'],
    [/naturel|natural|organic/i, 'natural'],
    [/corporate|business|professionnel/i, 'corporate'],
    [/pop\s*art|colorful|vibrant/i, 'vibrant'],
    [/dark|sombre|noir/i, 'dark'],
    [/pastel|doux|soft/i, 'pastel'],
  ];

  for (const [re, style] of patterns) {
    if (re.test(prompt)) styles.push(style);
  }

  return styles.length > 0 ? styles : ['modern'];
}

export function negativeToPositiveForFlux(negatives: string[]): string[] {
  const map: Record<string, string> = {
    blurry: 'sharp and clear focus',
    'low quality': 'high quality detailed render',
    'distorted text': 'clean legible text',
    watermark: 'clean image without watermarks',
    deformed: 'well-proportioned natural forms',
    ugly: 'aesthetically pleasing composition',
    'bad anatomy': 'correct natural anatomy',
    'bad proportions': 'correct proportions',
    nsfw: 'safe for work professional content',
    'poorly drawn': 'expertly rendered',
  };

  return negatives
    .map((n) => map[n.toLowerCase().trim()] ?? `without ${n}`)
    .filter(Boolean);
}
