import { aiRegistry } from '@/server/ai/providers';
import { analyzeImages, type VisionAnalysis } from './vision-analyzer';

export interface CreativeBrief {
  productName: string | null;
  productCategory: string | null;
  productDescription: string | null;
  targetAudience: string | null;
  objective: string | null;
  offer: string | null;
  tone: string | null;
  style: string | null;
  platform: string | null;
  constraints: string[];
  rawInput: string;
  visionAnalysis?: VisionAnalysis | null;
}

export function emptyBrief(rawInput: string): CreativeBrief {
  return {
    productName: null,
    productCategory: null,
    productDescription: null,
    targetAudience: null,
    objective: null,
    offer: null,
    tone: null,
    style: null,
    platform: null,
    constraints: [],
    rawInput,
    visionAnalysis: null,
  };
}

function stringOrNull(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value === 'string') return value.trim() || null;
  return null;
}

function parseBriefFromJson(text: string, rawInput: string): CreativeBrief {
  let data: unknown;
  try {
    const cleaned = text.trim().replace(/^```json\s*|\s*```$/g, '');
    data = JSON.parse(cleaned) as unknown;
  } catch {
    return emptyBrief(rawInput);
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return emptyBrief(rawInput);
  }
  const o = data as Record<string, unknown>;
  const constraints = Array.isArray(o.constraints)
    ? o.constraints.filter((item): item is string => typeof item === 'string')
    : [];
  return {
    productName: stringOrNull(o.productName),
    productCategory: stringOrNull(o.productCategory),
    productDescription: stringOrNull(o.productDescription),
    targetAudience: stringOrNull(o.targetAudience),
    objective: stringOrNull(o.objective),
    offer: stringOrNull(o.offer),
    tone: stringOrNull(o.tone),
    style: stringOrNull(o.style),
    platform: stringOrNull(o.platform),
    constraints,
    rawInput,
  };
}

/**
 * Fusionne intelligemment un brief texte avec une analyse vision.
 * Les infos vision priment quand le brief texte est null/vide,
 * mais le brief texte prime quand il est explicite.
 */
function mergeWithVision(brief: CreativeBrief, vision: VisionAnalysis | null): CreativeBrief {
  if (!vision || vision.confidence < 0.3) {
    return { ...brief, visionAnalysis: vision };
  }

  return {
    ...brief,
    productName: brief.productName ?? vision.detectedProduct,
    productCategory: brief.productCategory ?? vision.productCategory,
    productDescription:
      brief.productDescription ?? vision.richDescription ?? vision.detectedProduct,
    style: brief.style ?? (vision.dominantColors.length > 0 ? `couleurs ${vision.dominantColors.join(', ')}` : null),
    tone: brief.tone ?? vision.mood,
    visionAnalysis: vision,
  };
}

/**
 * Détecte des inférences automatiques basiques depuis le texte
 * pour combler les trous quand le LLM principal n'est pas dispo.
 */
function inferFromText(rawInput: string, brief: CreativeBrief): CreativeBrief {
  const text = rawInput.toLowerCase();
  const out = { ...brief };

  if (!out.platform) {
    if (/instagram|insta|story|stories/i.test(text)) out.platform = 'instagram';
    else if (/facebook|\bfb\b|meta/i.test(text)) out.platform = 'facebook';
    else if (/tiktok|tik\s*tok/i.test(text)) out.platform = 'tiktok';
    else if (/whatsapp|wa\b|status/i.test(text)) out.platform = 'whatsapp';
    else if (/flyer|prospectus|imprim/i.test(text)) out.platform = 'flyer';
  }

  if (!out.objective) {
    if (/promo|solde|sale|r[ée]duction|discount|black|cyber|deal|prix\s*barr/i.test(text)) {
      out.objective = 'promotion';
      if (!out.offer) {
        const m = text.match(/-?(\d{1,3})\s*%/);
        if (m) out.offer = `-${m[1]}%`;
      }
    } else if (/lancement|launch|nouveau|new|drop|sortie|d[eé]but/i.test(text)) {
      out.objective = 'lancement';
    } else if (/marque|brand|notori[eé]t[eé]|image/i.test(text)) {
      out.objective = 'notoriété';
    } else if (/vendre|vend|sell|conversion|achat|achete/i.test(text)) {
      out.objective = 'conversion';
    }
  }

  if (!out.tone) {
    if (/luxe|premium|haut\s*de\s*gamme|[ée]l[ée]gan|chic/i.test(text)) out.tone = 'premium';
    else if (/fun|drôle|cool|jeune|dynamique|street|urbain/i.test(text)) out.tone = 'dynamique';
    else if (/s[ée]rieux|corporate|professionnel|business/i.test(text)) out.tone = 'professionnel';
    else if (/naturel|bio|eco|vert|green|durable/i.test(text)) out.tone = 'naturel';
    else if (/chaleureux|familial|convivial/i.test(text)) out.tone = 'chaleureux';
  }

  return out;
}

interface AnalyzeBriefContext {
  brandKit?: { name: string; tone?: string | null; forbiddenWords: string[] };
  previousMessages?: Array<{ role: string; content: string }>;
  imageUrls?: string[];
  preComputedVision?: VisionAnalysis | null;
}

export async function analyzeBrief(
  userMessage: string,
  context?: AnalyzeBriefContext,
): Promise<CreativeBrief> {
  const provider = aiRegistry.getDefaultTextProviderOrNull();

  let visionAnalysis: VisionAnalysis | null = context?.preComputedVision ?? null;
  if (!visionAnalysis && context?.imageUrls && context.imageUrls.length > 0) {
    visionAnalysis = await analyzeImages(context.imageUrls);
  }

  if (!provider) {
    const empty = emptyBrief(userMessage);
    const inferred = inferFromText(userMessage, empty);
    return mergeWithVision(inferred, visionAnalysis);
  }

  const visionContextStr = visionAnalysis && visionAnalysis.detectedProduct
    ? `\n\nIMAGE DETECTÉE (analyse vision automatique) :
- Produit identifié : ${visionAnalysis.detectedProduct}
- Catégorie : ${visionAnalysis.productCategory ?? 'non identifiée'}
- Description visuelle : ${visionAnalysis.richDescription}
- Couleurs dominantes : ${visionAnalysis.dominantColors.join(', ')}
- Mood : ${visionAnalysis.mood ?? 'non identifié'}
- Type d'image : ${visionAnalysis.imageType}
- Angle suggéré : ${visionAnalysis.suggestedAngle ?? 'non spécifié'}

UTILISE CES INFOS comme la VÉRITÉ TERRAIN pour productName et productCategory si l'utilisateur n'a pas été explicite.`
    : '';

  const systemPrompt = `Tu es un directeur artistique publicitaire expert.

MISSION : extraire un brief créatif structuré du message client, MÊME SI L'INFO EST INCOMPLÈTE.
Tu dois INFÉRER intelligemment et REMPLIR au maximum. JAMAIS retourner null si une déduction raisonnable est possible.

Format JSON strict :
- productName: nom précis du produit/service (déduis depuis l'image si pas explicite)
- productCategory: catégorie parmi: beauté, mode, restauration, alimentation, immobilier, technologie, sport, automobile, santé, électroménager, animaux, voyage, luxe, finance, formation, services, e-commerce, autre
- productDescription: description courte du produit/sujet (1 phrase descriptive utile pour un photographe)
- targetAudience: déduis le public cible probable depuis le contexte (ex: "femmes 25-45 ans urbaines" ou null seulement si vraiment ambigu)
- objective: parmi: promotion, lancement, notoriété, conversion, awareness, retargeting (déduis depuis les mots-clés)
- offer: offre/promo si mentionnée (ex: "-30%", "2 pour 1", "livraison offerte"), sinon null
- tone: parmi: premium, dynamique, fun, professionnel, chaleureux, moderne, naturel, urbain, luxe (déduis du contexte)
- style: style visuel précis si mentionné ou déduisible (ex: "minimaliste lumineux", "street éditorial")
- platform: parmi: facebook, instagram, instagram_story, tiktok, whatsapp, banner, flyer (déduis si possible, sinon facebook par défaut pour les visuels publicitaires standard)
- constraints: tableau des contraintes/exigences (ex: ["sans texte", "fond blanc", "format carré"])

${context?.brandKit ? `Brand Kit actif : "${context.brandKit.name}", ton: "${context.brandKit.tone ?? 'non défini'}", mots interdits: [${context.brandKit.forbiddenWords.join(', ')}]` : ''}
${visionContextStr}

RÈGLES :
1. Si l'image montre un produit, productName et productCategory DOIVENT être remplis depuis l'image
2. Privilégie les déductions raisonnables aux null
3. Ne demande JAMAIS de clarification, déduis
4. Réponds UNIQUEMENT en JSON valide, sans markdown.`;

  let userPrompt = userMessage;
  if (context?.previousMessages?.length) {
    const history = context.previousMessages.slice(-6).map((m) => `${m.role}: ${m.content}`).join('\n');
    userPrompt = `Historique récent:\n${history}\n\nMessage actuel: ${userMessage}`;
  }

  try {
    const result = await provider.generateText({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      maxTokens: 800,
      responseFormat: 'json',
      images: context?.imageUrls,
      model: 'gpt-4o-mini',
    });

    const parsed = parseBriefFromJson(result.text, userMessage);
    const inferred = inferFromText(userMessage, parsed);
    return mergeWithVision(inferred, visionAnalysis);
  } catch (err) {
    console.warn('[BriefAnalyzer] LLM failed, falling back to heuristics:', err instanceof Error ? err.message : err);
    const empty = emptyBrief(userMessage);
    const inferred = inferFromText(userMessage, empty);
    return mergeWithVision(inferred, visionAnalysis);
  }
}
