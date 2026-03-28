import { aiRegistry } from '@/server/ai/providers';

export interface CreativeBrief {
  productName: string | null;
  productCategory: string | null;
  targetAudience: string | null;
  objective: string | null;
  offer: string | null;
  tone: string | null;
  style: string | null;
  platform: string | null;
  constraints: string[];
  rawInput: string;
}

export function emptyBrief(rawInput: string): CreativeBrief {
  return {
    productName: null,
    productCategory: null,
    targetAudience: null,
    objective: null,
    offer: null,
    tone: null,
    style: null,
    platform: null,
    constraints: [],
    rawInput,
  };
}

function stringOrNull(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value === 'string') return value;
  return null;
}

function parseBriefFromJson(text: string, rawInput: string): CreativeBrief {
  let data: unknown;
  try {
    data = JSON.parse(text) as unknown;
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

export async function analyzeBrief(
  userMessage: string,
  context?: {
    brandKit?: { name: string; tone?: string | null; forbiddenWords: string[] };
    previousMessages?: Array<{ role: string; content: string }>;
  },
): Promise<CreativeBrief> {
  const provider = aiRegistry.getDefaultTextProvider();

  const systemPrompt = `Tu es un directeur artistique publicitaire expert. Ton rôle est d'analyser le brief du client et d'en extraire les éléments clés pour créer un visuel publicitaire.

Analyse le message du client et extrais les informations suivantes au format JSON strict :
- productName: nom du produit/service (null si non mentionné)
- productCategory: catégorie (ex: "e-commerce", "restauration", "beauté", "immobilier", "mode", "sport")
- targetAudience: public cible (null si non mentionné)
- objective: objectif marketing (ex: "promotion", "lancement", "notoriété", "conversion")
- offer: offre/promotion mentionnée (null si non mentionnée)
- tone: ton souhaité (ex: "premium", "fun", "sérieux", "moderne", "chaleureux")
- style: style visuel souhaité (null si non mentionné)
- platform: plateforme cible (ex: "facebook", "instagram", "tiktok", "flyer", null si non mentionnée)
- constraints: tableau de contraintes ou demandes spécifiques

${context?.brandKit ? `Brand Kit actif : "${context.brandKit.name}", ton: "${context.brandKit.tone ?? 'non défini'}", mots interdits: [${context.brandKit.forbiddenWords.join(', ')}]` : ''}

Réponds UNIQUEMENT avec le JSON, sans markdown, sans explication.`;

  let userPrompt = userMessage;
  if (context?.previousMessages?.length) {
    const history = context.previousMessages.map((m) => `${m.role}: ${m.content}`).join('\n');
    userPrompt = `Historique:\n${history}\n\nNouveau message: ${userMessage}`;
  }

  const result = await provider.generateText({
    systemPrompt,
    userPrompt,
    temperature: 0.3,
    maxTokens: 800,
    responseFormat: 'json',
  });

  return parseBriefFromJson(result.text, userMessage);
}
