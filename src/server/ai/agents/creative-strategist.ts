import { aiRegistry } from '@/server/ai/providers';
import type { CreativeBrief } from './brief-analyzer';

export interface CreativeSuggestion {
  headline: string;
  subHeadline: string;
  cta: string;
  visualConcept: string;
  colorMood: string;
  reasoning: string;
}

export interface CreativeStrategy {
  suggestions: CreativeSuggestion[];
  recommendedApproach: string;
  toneAdvice: string;
}

const DEFAULT_STRATEGY: CreativeStrategy = {
  suggestions: [
    {
      headline: 'Découvrez notre offre',
      subHeadline: 'Une expérience unique vous attend',
      cta: 'En savoir plus',
      visualConcept: 'Design moderne et épuré',
      colorMood: 'Tons chauds et accueillants',
      reasoning: 'Angle générique par défaut',
    },
  ],
  recommendedApproach: 'Approche standard recommandée.',
  toneAdvice: 'Ton professionnel et engageant.',
};

function isCreativeSuggestion(value: unknown): value is CreativeSuggestion {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.headline === 'string' &&
    typeof o.subHeadline === 'string' &&
    typeof o.cta === 'string' &&
    typeof o.visualConcept === 'string' &&
    typeof o.colorMood === 'string' &&
    typeof o.reasoning === 'string'
  );
}

function parseCreativeStrategyJson(text: string): CreativeStrategy | null {
  let data: unknown;
  try {
    data = JSON.parse(text) as unknown;
  } catch {
    return null;
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) return null;
  const o = data as Record<string, unknown>;
  if (!Array.isArray(o.suggestions)) return null;
  const suggestions = o.suggestions.filter(isCreativeSuggestion);
  if (suggestions.length === 0) return null;
  if (typeof o.recommendedApproach !== 'string' || typeof o.toneAdvice !== 'string') {
    return null;
  }
  return {
    suggestions,
    recommendedApproach: o.recommendedApproach,
    toneAdvice: o.toneAdvice,
  };
}

export async function generateCreativeStrategy(
  brief: CreativeBrief,
  options?: {
    count?: number;
    brandKit?: { primaryColors: string[]; tone?: string | null; preferredCTAs: string[] };
  },
): Promise<CreativeStrategy> {
  const provider = aiRegistry.getDefaultTextProvider();
  const count = options?.count ?? 3;

  const systemPrompt = `Tu es un expert en stratégie publicitaire et en copywriting. À partir d'un brief créatif, tu proposes ${count} angles créatifs différents pour une affiche publicitaire.

Pour chaque suggestion, fournis :
- headline: accroche principale (courte, percutante, max 8 mots)
- subHeadline: sous-titre ou texte d'appui (1 phrase)
- cta: appel à l'action (ex: "Découvrir", "Commander", "-30% aujourd'hui")
- visualConcept: description du concept visuel en 1-2 phrases
- colorMood: palette de couleurs/ambiance suggérée
- reasoning: pourquoi cet angle fonctionne (1 phrase)

Ajoute aussi :
- recommendedApproach: quel angle tu recommandes et pourquoi (2 phrases)
- toneAdvice: conseil sur le ton global (1 phrase)

${options?.brandKit ? `Brand Kit : couleurs primaires [${options.brandKit.primaryColors.join(', ')}], ton "${options.brandKit.tone ?? 'non défini'}", CTAs préférés [${options.brandKit.preferredCTAs.join(', ')}]` : ''}

Réponds UNIQUEMENT en JSON valide. Le JSON doit avoir les clés : suggestions (tableau), recommendedApproach (string), toneAdvice (string).`;

  const userPrompt = `Brief créatif :
- Produit : ${brief.productName ?? 'Non spécifié'}
- Catégorie : ${brief.productCategory ?? 'Non spécifiée'}
- Public cible : ${brief.targetAudience ?? 'Non spécifié'}
- Objectif : ${brief.objective ?? 'Non spécifié'}
- Offre : ${brief.offer ?? 'Aucune offre spécifique'}
- Ton : ${brief.tone ?? 'Non spécifié'}
- Style : ${brief.style ?? 'Non spécifié'}
- Plateforme : ${brief.platform ?? 'Non spécifiée'}
- Contraintes : ${brief.constraints.length > 0 ? brief.constraints.join(', ') : 'Aucune'}`;

  const result = await provider.generateText({
    systemPrompt,
    userPrompt,
    temperature: 0.7,
    maxTokens: 1500,
    responseFormat: 'json',
  });

  const parsed = parseCreativeStrategyJson(result.text);
  return parsed ?? DEFAULT_STRATEGY;
}
