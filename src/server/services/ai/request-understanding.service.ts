import {
  GenerationTaskType,
  QualityModeEnum,
  TextRequirementMode,
  type NormalizedGenerationBrief,
} from '@/lib/ai';
import {
  detectTaskType,
  detectTextRequirement,
  detectRealismLevel,
  extractStyleIntent,
  negativeToPositiveForFlux,
} from '@/lib/ai/heuristics';

const STOP_WORDS =
  /\b(une?|des?|du|le|la|les|de|pour|avec|sur|dans|mon|ma|mes|un|ce|cette|qui|que|au|aux|en|et|ou|je|tu|il|nous|vous|ils|cre[eé]e?|genere|gene?rer?|fais|fait|lance|montre|image|visuel|affiche|poster|photo|format|s'?il\s*(?:te|vous)\s*pla[iî]t)\b/gi;

const STANDARD_NEGATIVES = [
  'blurry', 'low quality', 'distorted text', 'watermark', 'signature',
  'deformed', 'ugly', 'duplicate', 'morbid', 'mutilated', 'poorly drawn',
  'bad anatomy', 'bad proportions', 'extra limbs', 'cloned face',
  'disfigured', 'gross proportions', 'nsfw', 'nude', 'violent', 'gore',
];

interface AnalyzeInput {
  prompt: string;
  projectId?: string;
  conversationId?: string;
  qualityMode?: string;
  platform?: string;
  aspectRatio?: string;
  referenceImageIds?: string[];
  referenceImageUrls?: string[];
  brandKitId?: string;
  exactTexts?: string[];
}

function cleanPrompt(raw: string): string {
  return raw
    .replace(STOP_WORDS, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function mapQuality(mode?: string): QualityModeEnum {
  switch (mode?.toUpperCase()) {
    case 'DRAFT': return QualityModeEnum.DRAFT;
    case 'PREMIUM': return QualityModeEnum.PREMIUM;
    default: return QualityModeEnum.STANDARD;
  }
}

function detectPlatform(prompt: string, explicit?: string): string | undefined {
  if (explicit) return explicit;
  if (/facebook/i.test(prompt)) return 'facebook';
  if (/instagram\s*stor/i.test(prompt)) return 'instagram_story';
  if (/instagram/i.test(prompt)) return 'instagram';
  if (/tiktok/i.test(prompt)) return 'tiktok';
  if (/whatsapp/i.test(prompt)) return 'whatsapp';
  if (/flyer|imprim/i.test(prompt)) return 'flyer';
  if (/banner|banni[eè]re/i.test(prompt)) return 'banner';
  return undefined;
}

function detectProductInfo(prompt: string): { name?: string; category?: string } {
  const categories: Record<string, string> = {
    'basket|sneaker|chaussure|shoe|nike|adidas|jordan|v[eê]tement|robe|mode|fashion': 'mode',
    'restaurant|food|nourriture|pizza|burger|café|coffee': 'restauration',
    'beaut[ée]|cosm[ée]ti|maquillage|skin|cream|parfum|soin': 'beauté',
    'immobilier|maison|appartement|house|villa': 'immobilier',
    'tech|app|logiciel|saas|mobile': 'technologie',
    'sport|fitness|gym|muscul': 'sport',
    'voiture|auto|car|v[ée]hicule': 'automobile',
    'pharma|m[ée]dicament|sant[ée]|cr[eè]me|peau|derma': 'santé',
    'bijou|jewel|montre|watch|luxe|luxury': 'luxe',
  };

  let category: string | undefined;
  for (const [pattern, cat] of Object.entries(categories)) {
    if (new RegExp(pattern, 'i').test(prompt)) {
      category = cat;
      break;
    }
  }

  const cleaned = cleanPrompt(prompt);
  const name = cleaned.length > 2 ? cleaned.slice(0, 80) : undefined;

  return { name, category };
}

export const requestUnderstandingService = {
  analyzeRequest(input: AnalyzeInput): NormalizedGenerationBrief {
    const { prompt } = input;
    const refIdCount = input.referenceImageIds?.length ?? 0;
    const refUrlCount = input.referenceImageUrls?.length ?? 0;
    const refCount = Math.max(refIdCount, refUrlCount);

    const taskType = detectTaskType(prompt, refCount);
    const textReq = detectTextRequirement(prompt);
    const realismLevel = detectRealismLevel(prompt);
    const styleIntent = extractStyleIntent(prompt);
    const product = detectProductInfo(prompt);
    const platform = detectPlatform(prompt, input.platform);
    const qualityMode = mapQuality(input.qualityMode);

    const allExactTexts = [
      ...(input.exactTexts ?? []),
      ...textReq.exactTexts,
    ];

    const needPhotorealism =
      realismLevel === 'high' ||
      taskType === GenerationTaskType.PHOTOREALISTIC_AD ||
      taskType === GenerationTaskType.PRODUCT_SHOT ||
      taskType === GenerationTaskType.LIFESTYLE_SCENE;

    const needVisibleText =
      textReq.level !== 'low' ||
      taskType === GenerationTaskType.POSTER_TEXT_HEAVY ||
      taskType === GenerationTaskType.LOGO_LIKE_TEXT_VISUAL;

    const needExactText =
      textReq.mode === TextRequirementMode.EXACT || allExactTexts.length > 0;

    const needPosterStyle =
      taskType === GenerationTaskType.POSTER_TEXT_HEAVY ||
      taskType === GenerationTaskType.LOGO_LIKE_TEXT_VISUAL;

    const needProductFocus =
      taskType === GenerationTaskType.PRODUCT_SHOT || !!product.category;

    const needTypographyQuality = needVisibleText || needPosterStyle;

    const translatedConstraintsForFlux = negativeToPositiveForFlux(STANDARD_NEGATIVES);

    return {
      rawUserPrompt: prompt,
      cleanedPrompt: cleanPrompt(prompt),
      taskType,

      productName: product.name,
      productCategory: product.category,
      platform,
      format: input.aspectRatio,
      aspectRatio: input.aspectRatio,
      language: 'fr',

      textNeedLevel: textReq.level,
      textRequirementMode: textReq.mode,
      providedExactText: allExactTexts,

      realismLevel,
      styleIntent,

      needVisibleText,
      needExactText,
      needPhotorealism,
      needProductFocus,
      needPosterStyle,
      needTypographyQuality,

      referenceAssetCount: refCount,
      referenceAssetIds: input.referenceImageIds ?? [],

      brandKitId: input.brandKitId,
      projectId: input.projectId,
      conversationId: input.conversationId,
      historicalProjectContext: [],

      positiveConstraints: [],
      negativeConstraintsRaw: STANDARD_NEGATIVES,
      translatedConstraintsForFlux,

      qualityMode,
    };
  },
};
