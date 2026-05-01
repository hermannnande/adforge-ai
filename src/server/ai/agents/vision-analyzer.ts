import { aiRegistry } from '@/server/ai/providers';

export interface VisionAnalysis {
  detectedProduct: string | null;
  productCategory: string | null;
  productSubcategory: string | null;
  dominantColors: string[];
  setting: string | null;
  mood: string | null;
  visibleText: string[];
  hasPerson: boolean;
  hasLogo: boolean;
  imageType: 'product' | 'lifestyle' | 'logo' | 'reference' | 'person' | 'unknown';
  richDescription: string;
  suggestedAngle: string | null;
  confidence: number;
}

const EMPTY_VISION: VisionAnalysis = {
  detectedProduct: null,
  productCategory: null,
  productSubcategory: null,
  dominantColors: [],
  setting: null,
  mood: null,
  visibleText: [],
  hasPerson: false,
  hasLogo: false,
  imageType: 'unknown',
  richDescription: '',
  suggestedAngle: null,
  confidence: 0,
};

const visionCache = new Map<string, { analysis: VisionAnalysis; expiresAt: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000;

function cacheKey(imageUrls: string[]): string {
  return imageUrls.slice().sort().join('|').slice(0, 500);
}

function isVisionAnalysis(value: unknown): value is Partial<VisionAnalysis> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseVisionJson(text: string): VisionAnalysis {
  let data: unknown;
  try {
    const cleaned = text.trim().replace(/^```json\s*|\s*```$/g, '');
    data = JSON.parse(cleaned);
  } catch {
    return EMPTY_VISION;
  }
  if (!isVisionAnalysis(data)) return EMPTY_VISION;
  const o = data as Record<string, unknown>;

  const stringOrNull = (v: unknown): string | null =>
    typeof v === 'string' && v.trim() ? v.trim() : null;

  const stringArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0) : [];

  const imageType = stringOrNull(o.imageType);
  const validTypes: VisionAnalysis['imageType'][] = ['product', 'lifestyle', 'logo', 'reference', 'person', 'unknown'];
  const safeImageType: VisionAnalysis['imageType'] =
    imageType && (validTypes as string[]).includes(imageType)
      ? (imageType as VisionAnalysis['imageType'])
      : 'unknown';

  return {
    detectedProduct: stringOrNull(o.detectedProduct),
    productCategory: stringOrNull(o.productCategory),
    productSubcategory: stringOrNull(o.productSubcategory),
    dominantColors: stringArray(o.dominantColors),
    setting: stringOrNull(o.setting),
    mood: stringOrNull(o.mood),
    visibleText: stringArray(o.visibleText),
    hasPerson: o.hasPerson === true,
    hasLogo: o.hasLogo === true,
    imageType: safeImageType,
    richDescription: stringOrNull(o.richDescription) ?? '',
    suggestedAngle: stringOrNull(o.suggestedAngle),
    confidence: typeof o.confidence === 'number' ? Math.max(0, Math.min(1, o.confidence)) : 0.5,
  };
}

export async function analyzeImages(imageUrls: string[]): Promise<VisionAnalysis> {
  if (!imageUrls || imageUrls.length === 0) {
    return EMPTY_VISION;
  }

  const validUrls = imageUrls
    .filter((u) => typeof u === 'string' && u.length > 0)
    .slice(0, 4);

  if (validUrls.length === 0) return EMPTY_VISION;

  const key = cacheKey(validUrls);
  const cached = visionCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.analysis;
  }

  const provider = aiRegistry.getDefaultTextProviderOrNull();
  if (!provider) return EMPTY_VISION;

  const systemPrompt = `Tu es un directeur artistique expert qui analyse des images pour créer des affiches publicitaires.

Pour chaque image fournie (jusqu'à 4), identifie en JSON STRICT:
- detectedProduct: nom précis du produit principal visible (ex: "crème anti-rides Nivea", "sneakers Air Jordan rouges", "burger artisanal au bacon"). Sois SPÉCIFIQUE.
- productCategory: catégorie générale parmi: beauté, mode, restauration, alimentation, immobilier, technologie, sport, automobile, santé, électroménager, animaux, voyage, luxe, finance, formation, services, e-commerce, autre
- productSubcategory: sous-catégorie précise (ex: "soin visage anti-âge", "sneakers basketball", "fast-food premium")
- dominantColors: 3 couleurs dominantes en français simple (ex: ["doré", "blanc nacré", "noir mat"])
- setting: contexte/décor visible (ex: "studio fond blanc", "salle de bain moderne", "extérieur urbain")
- mood: ambiance générale (ex: "luxueux et épuré", "joyeux et coloré", "sérieux et professionnel")
- visibleText: tableau des textes/marques lisibles dans l'image (peut être vide)
- hasPerson: true si une personne/visage est présent
- hasLogo: true si un logo de marque est identifiable
- imageType: 'product' (packshot produit), 'lifestyle' (mise en scène d'usage), 'logo' (logo seul), 'reference' (inspiration/style), 'person' (portrait/personne), ou 'unknown'
- richDescription: description visuelle riche en 2-3 phrases que tu donnerais à un photographe pour reproduire un visuel cohérent (matière, lumière, composition, détails clés du produit qui DOIVENT apparaître)
- suggestedAngle: angle marketing recommandé en 1 phrase (ex: "mettre en avant la texture luxueuse en gros plan", "style lifestyle avec utilisation visible")
- confidence: 0.0 à 1.0 — ta certitude sur l'identification

Si plusieurs images, fusionne intelligemment (le produit principal est généralement celui qui apparaît le plus net/grand/répété).

Réponds UNIQUEMENT en JSON valide, sans markdown.`;

  try {
    const result = await provider.generateText({
      systemPrompt,
      userPrompt:
        validUrls.length === 1
          ? "Analyse cette image et identifie le produit/sujet principal."
          : `Analyse ces ${validUrls.length} images. Identifie le produit/sujet principal commun.`,
      temperature: 0.2,
      maxTokens: 800,
      responseFormat: 'json',
      images: validUrls,
      model: 'gpt-4o-mini',
    });

    const analysis = parseVisionJson(result.text);
    visionCache.set(key, { analysis, expiresAt: Date.now() + CACHE_TTL_MS });
    return analysis;
  } catch (err) {
    console.warn('[VisionAnalyzer] Failed to analyze images:', err instanceof Error ? err.message : err);
    return EMPTY_VISION;
  }
}

export function summarizeVisionForPrompt(analysis: VisionAnalysis): string {
  if (!analysis.detectedProduct && !analysis.richDescription) return '';

  const parts: string[] = [];
  if (analysis.detectedProduct) parts.push(`Product: ${analysis.detectedProduct}`);
  if (analysis.productCategory) parts.push(`Category: ${analysis.productCategory}`);
  if (analysis.dominantColors.length > 0) {
    parts.push(`Colors: ${analysis.dominantColors.join(', ')}`);
  }
  if (analysis.richDescription) parts.push(`Visual: ${analysis.richDescription}`);
  if (analysis.suggestedAngle) parts.push(`Angle: ${analysis.suggestedAngle}`);

  return parts.join(' | ');
}
