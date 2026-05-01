import { analyzeBrief, emptyBrief, type CreativeBrief } from './brief-analyzer';
import { generateCreativeStrategy, type CreativeStrategy } from './creative-strategist';
import { analyzeImages, summarizeVisionForPrompt, type VisionAnalysis } from './vision-analyzer';
import {
  matchMarketingTemplate,
  composeVisualConceptFromTemplate,
  pickHeadlineFromTemplate,
  pickCtaFromTemplate,
  type MarketingTemplate,
} from './marketing-templates';
import { decideAutoGenerate, buildConfirmationMessage } from './auto-decision';
import { aiRegistry } from '@/server/ai/providers';

export type ChatMessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: ChatMessageRole;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface ChatContext {
  projectId: string;
  messages: ChatMessage[];
  brief?: CreativeBrief;
  strategy?: CreativeStrategy;
  referenceImageUrls?: string[];
  brandKit?: {
    name: string;
    tone?: string | null;
    primaryColors: string[];
    secondaryColors: string[];
    fonts: string[];
    preferredCTAs: string[];
    forbiddenWords: string[];
  };
}

export interface ChatResponse {
  message: string;
  brief?: CreativeBrief;
  strategy?: CreativeStrategy;
  shouldGenerate: boolean;
  metadata: Record<string, unknown>;
}

const TRIVIAL_MSG_PATTERN =
  /^\s*(salut|bonjour|hello|hi|hey|coucou|test|allo|aide|help|quoi|comment(\s*[çc]a\s*va)?|\?+|\.+|ok|oui|non|yes|no|merci|thanks?)\s*[!?.]*\s*$/i;

/**
 * Construit une stratégie créative de fallback à partir d'un template marketing.
 * Utilisé quand le LLM est indisponible OU pour court-circuiter en mode rapide.
 */
function buildStrategyFromTemplate(
  template: MarketingTemplate,
  brief: CreativeBrief,
  vision: VisionAnalysis | null,
  qualityMode: 'draft' | 'standard' | 'premium',
): CreativeStrategy {
  const visionSummary = vision ? summarizeVisionForPrompt(vision) : null;
  const visualConcept = composeVisualConceptFromTemplate({
    template,
    productName: brief.productName,
    productCategory: brief.productCategory,
    visionSummary,
    qualityMode,
  });

  return {
    suggestions: [
      {
        headline: pickHeadlineFromTemplate(template, brief.productName, brief.offer, 0),
        subHeadline: brief.productDescription ?? template.toneAdvice,
        cta: pickCtaFromTemplate(template, 0),
        visualConcept,
        colorMood:
          template.colorPalettes[0]?.join(', ') ?? template.moodKeywords.slice(0, 3).join(', '),
        reasoning: `Template ${template.sector}/${template.useCase} — ${template.toneAdvice}`,
      },
      {
        headline: pickHeadlineFromTemplate(template, brief.productName, brief.offer, 1),
        subHeadline: brief.productDescription ?? template.moodKeywords.slice(0, 2).join(' & '),
        cta: pickCtaFromTemplate(template, 1),
        visualConcept: composeVisualConceptFromTemplate({
          template,
          productName: brief.productName,
          productCategory: brief.productCategory,
          visionSummary,
          qualityMode,
        }),
        colorMood:
          template.colorPalettes[1]?.join(', ') ??
          template.colorPalettes[0]?.join(', ') ??
          'tons neutres',
        reasoning: `Variante ${template.useCase} — angle alternatif`,
      },
      {
        headline: pickHeadlineFromTemplate(template, brief.productName, brief.offer, 2),
        subHeadline: brief.productDescription ?? `${template.sector} — qualité premium`,
        cta: pickCtaFromTemplate(template, 2),
        visualConcept: composeVisualConceptFromTemplate({
          template,
          productName: brief.productName,
          productCategory: brief.productCategory,
          visionSummary,
          qualityMode,
        }),
        colorMood:
          template.colorPalettes[2]?.join(', ') ??
          template.colorPalettes[0]?.join(', ') ??
          'tons signature',
        reasoning: `Variante ${template.useCase} — palette alternative`,
      },
    ],
    recommendedApproach: `Approche ${template.sector} ${template.useCase} : ${template.toneAdvice}`,
    toneAdvice: template.toneAdvice,
  };
}

/**
 * Détermine le qualityMode par défaut basé sur le brief.
 */
function inferQualityMode(brief: CreativeBrief): 'draft' | 'standard' | 'premium' {
  const text = `${brief.rawInput} ${brief.tone ?? ''} ${brief.style ?? ''}`.toLowerCase();
  if (/luxe|premium|haut.?de.?gamme|chic|exception/i.test(text)) return 'premium';
  if (/draft|brouillon|test|aperçu|rapide|preview/i.test(text)) return 'draft';
  return 'standard';
}

/**
 * Génère un court message confirmant la génération en cours, en utilisant
 * le LLM pour être chaleureux/contextuel — fallback statique si LLM échoue.
 */
async function buildAssistantConfirmation(params: {
  userMessage: string;
  brief: CreativeBrief;
  template: MarketingTemplate;
  inferredFromVision: boolean;
  qualityMode: 'draft' | 'standard' | 'premium';
}): Promise<string> {
  const { userMessage, brief, template, inferredFromVision, qualityMode } = params;
  const provider = aiRegistry.getDefaultTextProviderOrNull();

  const fallback = buildConfirmationMessage({
    productName: brief.productName,
    templateSector: template.sector,
    inferredFromVision,
    qualityMode,
  });

  if (!provider) return fallback;

  const visionLine = brief.visionAnalysis?.detectedProduct
    ? `Image analysée : ${brief.visionAnalysis.detectedProduct}.`
    : '';

  const systemPrompt = `Tu es l'assistant créatif AdForge AI. Tu confirmes une génération en cours, en français.

RÈGLES STRICTES :
1. JAMAIS poser de question. JAMAIS demander d'info supplémentaire.
2. Le visuel se génère automatiquement — tu ne fais qu'annoncer ce qui arrive.
3. Maximum 2 phrases. Ton confiant, professionnel, chaleureux.
4. Mentionne brièvement : le produit identifié + le style choisi.
5. Termine par "Génération en cours..." ou "Voici votre visuel..." ou similaire.
6. Pas de markdown lourd. Pas plus de 1 emoji.
7. Si une image a été fournie, dis explicitement que tu l'as analysée et utilisée.`;

  const userPrompt = `Message client : "${userMessage}"
Brief détecté : produit="${brief.productName ?? 'non précisé'}", catégorie="${brief.productCategory ?? template.sector}", ton="${brief.tone ?? template.toneAdvice}"
${visionLine}
Template choisi : ${template.sector}/${template.useCase}
Qualité : ${qualityMode}

Écris UNE confirmation courte (max 2 phrases) annonçant que tu lances la génération.`;

  try {
    const result = await provider.generateText({
      systemPrompt,
      userPrompt,
      temperature: 0.6,
      maxTokens: 150,
      model: 'gpt-4o-mini',
    });
    const text = result.text.trim();
    return text.length > 10 ? text : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Génère un message de clarification quand le score est trop bas pour générer.
 * Pose UNE seule question, courte et précise — JAMAIS plusieurs.
 */
async function buildClarificationMessage(params: {
  userMessage: string;
  brief: CreativeBrief;
  hasReferenceImages: boolean;
  conversationLength: number;
}): Promise<string> {
  const { userMessage, hasReferenceImages, conversationLength } = params;
  const provider = aiRegistry.getDefaultTextProviderOrNull();

  if (!provider) {
    if (conversationLength <= 1) {
      return (
        '👋 Bienvenue ! Décrivez votre besoin en une phrase et j\'lance la création. ' +
        'Exemple : "affiche pour ma crème anti-âge" ou ajoutez une image de votre produit.'
      );
    }
    return 'Pour créer le visuel, dites-moi en une phrase ce que vous voulez promouvoir, ou ajoutez une image.';
  }

  const systemPrompt = `Tu es l'assistant créatif AdForge AI.

Le client a envoyé un message trop court ou trivial pour générer un visuel.
${hasReferenceImages ? 'Une image est fournie — utilise-la pour proposer une création.' : 'Aucune image fournie.'}

RÈGLES STRICTES :
1. UNE SEULE question, très courte (max 15 mots).
2. Sois concret : demande "que voulez-vous vendre/promouvoir ?" — JAMAIS plusieurs questions enchaînées.
3. Donne 1-2 exemples concrets pour aider le client à répondre.
4. Ton chaleureux, en français, max 1 emoji.
5. Maximum 2 phrases au total.`;

  try {
    const result = await provider.generateText({
      systemPrompt,
      userPrompt: `Message client trop bref : "${userMessage}"`,
      temperature: 0.5,
      maxTokens: 120,
      model: 'gpt-4o-mini',
    });
    return result.text.trim();
  } catch {
    return 'Décrivez en une phrase ce que vous voulez promouvoir (ex: "affiche pour ma crème anti-âge") ou ajoutez une image.';
  }
}

export async function processChat(
  userMessage: string,
  context: ChatContext,
): Promise<ChatResponse> {
  const trimmed = userMessage.trim();
  const hasReferenceImages = Boolean(
    context.referenceImageUrls && context.referenceImageUrls.length > 0,
  );

  let visionAnalysis: VisionAnalysis | null = null;
  if (hasReferenceImages) {
    visionAnalysis = await analyzeImages(context.referenceImageUrls!);
  }

  let brief: CreativeBrief;
  try {
    brief = await analyzeBrief(userMessage, {
      brandKit: context.brandKit
        ? {
            name: context.brandKit.name,
            tone: context.brandKit.tone,
            forbiddenWords: context.brandKit.forbiddenWords,
          }
        : undefined,
      previousMessages: context.messages.map((m) => ({ role: m.role, content: m.content })),
      imageUrls: context.referenceImageUrls,
      preComputedVision: visionAnalysis,
    });
  } catch (err) {
    console.warn('[ChatAgent] analyzeBrief failed, using empty brief:', err instanceof Error ? err.message : err);
    brief = emptyBrief(userMessage);
  }

  const matchInput = {
    rawText: `${userMessage} ${brief.productName ?? ''} ${brief.productDescription ?? ''} ${visionAnalysis?.detectedProduct ?? ''} ${visionAnalysis?.productCategory ?? ''}`,
    detectedCategory: brief.productCategory ?? visionAnalysis?.productCategory ?? null,
    detectedSubcategory: visionAnalysis?.productSubcategory ?? null,
    isPromo: /promo|solde|sale|r[ée]duction|-?\d+\s*%|black|cyber/i.test(userMessage),
    isLaunch: /lancement|launch|nouveau|new|drop/i.test(userMessage),
  };

  const templateMatch = matchMarketingTemplate(matchInput);

  const decision = decideAutoGenerate({
    userMessage,
    brief,
    vision: visionAnalysis,
    hasReferenceImages,
    conversationLength: context.messages.length,
    templateConfidence: templateMatch.confidence,
  });

  const isTrivial =
    TRIVIAL_MSG_PATTERN.test(trimmed) && !hasReferenceImages && !brief.productName;

  if (isTrivial || !decision.shouldGenerate) {
    const message = await buildClarificationMessage({
      userMessage,
      brief,
      hasReferenceImages,
      conversationLength: context.messages.length,
    });
    return {
      message,
      brief,
      strategy: undefined,
      shouldGenerate: false,
      metadata: {
        decision,
        templateMatch: { id: templateMatch.template.id, confidence: templateMatch.confidence },
        visionDetected: visionAnalysis?.detectedProduct ?? null,
      },
    };
  }

  const qualityMode = inferQualityMode(brief);

  let strategy: CreativeStrategy;
  try {
    strategy = await generateCreativeStrategy(brief, {
      count: 3,
      brandKit: context.brandKit
        ? {
            primaryColors: context.brandKit.primaryColors,
            tone: context.brandKit.tone,
            preferredCTAs: context.brandKit.preferredCTAs,
          }
        : undefined,
    });

    if (!strategy.suggestions || strategy.suggestions.length === 0) {
      strategy = buildStrategyFromTemplate(templateMatch.template, brief, visionAnalysis, qualityMode);
    } else {
      const visionSummary = visionAnalysis ? summarizeVisionForPrompt(visionAnalysis) : null;
      strategy = {
        ...strategy,
        suggestions: strategy.suggestions.map((s, i) => ({
          ...s,
          visualConcept:
            s.visualConcept && s.visualConcept.length > 30
              ? `${s.visualConcept}, ${templateMatch.template.photoStyle}${visionSummary ? `, ${visionSummary}` : ''}`
              : composeVisualConceptFromTemplate({
                  template: templateMatch.template,
                  productName: brief.productName,
                  productCategory: brief.productCategory,
                  visionSummary,
                  qualityMode,
                }),
          headline: s.headline || pickHeadlineFromTemplate(templateMatch.template, brief.productName, brief.offer, i),
          cta: s.cta || pickCtaFromTemplate(templateMatch.template, i),
        })),
      };
    }
  } catch (err) {
    console.warn('[ChatAgent] strategy generation failed, using template fallback:', err instanceof Error ? err.message : err);
    strategy = buildStrategyFromTemplate(templateMatch.template, brief, visionAnalysis, qualityMode);
  }

  const message = await buildAssistantConfirmation({
    userMessage,
    brief,
    template: templateMatch.template,
    inferredFromVision: decision.inferredFromVision,
    qualityMode,
  });

  return {
    message,
    brief,
    strategy,
    shouldGenerate: true,
    metadata: {
      decision,
      templateMatch: {
        id: templateMatch.template.id,
        sector: templateMatch.template.sector,
        useCase: templateMatch.template.useCase,
        confidence: templateMatch.confidence,
      },
      visionDetected: visionAnalysis?.detectedProduct ?? null,
      qualityMode,
      autoInferred: decision.inferredFromVision,
    },
  };
}
