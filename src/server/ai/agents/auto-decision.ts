import type { CreativeBrief } from './brief-analyzer';
import type { VisionAnalysis } from './vision-analyzer';

export interface AutoDecisionInput {
  userMessage: string;
  brief: CreativeBrief;
  vision: VisionAnalysis | null;
  hasReferenceImages: boolean;
  conversationLength: number;
  templateConfidence: number;
}

export interface AutoDecision {
  shouldGenerate: boolean;
  confidence: number;
  reasoning: string[];
  inferredFromVision: boolean;
}

/**
 * Décide si on doit lancer la génération immédiatement ou poser une question.
 *
 * PHILOSOPHIE INVERSÉE :
 * - Par défaut on génère TOUJOURS (même sur prompt incomplet)
 * - On ne pose une question que si le message est trivial/incompréhensible
 *   ET qu'aucune image n'est fournie ET qu'aucune catégorie n'est détectée
 *
 * Score sur 100, seuil de génération à 35 (très permissif intentionnellement).
 */
export function decideAutoGenerate(input: AutoDecisionInput): AutoDecision {
  const { userMessage, brief, vision, hasReferenceImages, conversationLength, templateConfidence } = input;

  const reasoning: string[] = [];
  let score = 0;
  let inferredFromVision = false;

  if (hasReferenceImages) {
    score += 35;
    reasoning.push('Image(s) de référence fournie(s) — interprétation directe possible');
    inferredFromVision = true;
  }

  if (vision && vision.detectedProduct && vision.confidence > 0.5) {
    score += 25;
    reasoning.push(`Produit identifié dans l'image : ${vision.detectedProduct}`);
  }

  if (vision && vision.productCategory) {
    score += 10;
    reasoning.push(`Catégorie détectée : ${vision.productCategory}`);
  }

  if (brief.productName) {
    score += 15;
    reasoning.push(`Produit mentionné : ${brief.productName}`);
  }

  if (brief.productCategory) {
    score += 10;
    reasoning.push(`Catégorie : ${brief.productCategory}`);
  }

  if (brief.objective) {
    score += 5;
    reasoning.push(`Objectif : ${brief.objective}`);
  }

  if (brief.platform) score += 3;
  if (brief.tone) score += 3;
  if (brief.style) score += 2;
  if (brief.offer) {
    score += 5;
    reasoning.push('Offre/promo mentionnée');
  }

  if (templateConfidence >= 0.6) {
    score += 12;
    reasoning.push(`Template marketing matché (confiance ${Math.round(templateConfidence * 100)}%)`);
  } else if (templateConfidence >= 0.3) {
    score += 6;
  }

  const trimmed = userMessage.trim();
  const wordCount = trimmed.split(/\s+/).filter((w) => w.length > 1).length;

  if (wordCount >= 5) score += 8;
  else if (wordCount >= 3) score += 4;

  const isTrivial = /^(salut|bonjour|hello|hi|hey|coucou|test|allo|aide|help|quoi|comment|\?+|\.+)$/i.test(trimmed);
  if (isTrivial && !hasReferenceImages) {
    score = Math.min(score, 10);
    reasoning.push('Message trivial sans image — clarification nécessaire');
  }

  if (conversationLength >= 4 && !hasReferenceImages && !brief.productName && !vision?.detectedProduct) {
    score += 15;
    reasoning.push('Conversation longue sans clarification — on génère avec defaults intelligents');
  }

  const GENERATE_THRESHOLD = 35;
  const shouldGenerate = score >= GENERATE_THRESHOLD;

  return {
    shouldGenerate,
    confidence: Math.min(1, score / 100),
    reasoning,
    inferredFromVision,
  };
}

/**
 * Renvoie le message de confirmation à afficher quand on lance la génération.
 * Court, confiant, jamais une question.
 */
export function buildConfirmationMessage(input: {
  productName: string | null;
  templateSector: string;
  inferredFromVision: boolean;
  qualityMode: 'draft' | 'standard' | 'premium';
}): string {
  const { productName, templateSector, inferredFromVision, qualityMode } = input;

  const product = productName ?? 'votre visuel';
  const qualityLabel = qualityMode === 'premium' ? 'rendu premium' : qualityMode === 'draft' ? 'aperçu rapide' : 'rendu pro';

  if (inferredFromVision) {
    return (
      `Parfait, j'ai analysé votre image. Je crée une affiche ${templateSector} ` +
      `pour **${product}** en ${qualityLabel}. Génération en cours...`
    );
  }

  return (
    `C'est noté ! Je lance la création de votre affiche ${templateSector} ` +
    `pour **${product}** (${qualityLabel}). Génération en cours...`
  );
}
