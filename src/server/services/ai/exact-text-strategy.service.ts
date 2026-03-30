import { TextRequirementMode } from '@/lib/ai/enums';
import type {
  NormalizedGenerationBrief,
  ExactTextOverlayPlan,
  ProviderExecutionResult,
} from '@/lib/ai/types';

const EXACT_TEXT_PATTERNS = [
  /prix\s*[:=]?\s*([\d\s.,]+\s*(?:fcfa|€|xof|eur|\$|cfa)?)/gi,
  /(?:whatsapp|tel|t[ée]l[ée]phone|contact)\s*[:=]?\s*(\+?[\d\s.-]{7,})/gi,
  /(?:promo|offre|r[ée]duction)\s*[:=]?\s*(-?\d+\s*%)/gi,
  /"([^"]{2,100})"/g,
];

export const exactTextStrategyService = {
  detectExactTextNeed(
    brief: NormalizedGenerationBrief,
  ): { mode: 'AI_TEXT_OK' | 'DETERMINISTIC_TEXT_REQUIRED'; texts: string[] } {
    if (brief.textRequirementMode === TextRequirementMode.NONE) {
      return { mode: 'AI_TEXT_OK', texts: [] };
    }

    const texts = [...brief.providedExactText];

    for (const pattern of EXACT_TEXT_PATTERNS) {
      const matches = brief.rawUserPrompt.matchAll(new RegExp(pattern.source, pattern.flags));
      for (const m of matches) {
        const text = (m[1] ?? m[0]).trim();
        if (text && !texts.includes(text)) {
          texts.push(text);
        }
      }
    }

    const hasCriticalText = texts.some((t) =>
      /\d{4,}|\+?\d[\d\s.-]{6,}|fcfa|€|\$|%/.test(t),
    );

    if (
      brief.textRequirementMode === TextRequirementMode.EXACT ||
      hasCriticalText
    ) {
      return { mode: 'DETERMINISTIC_TEXT_REQUIRED', texts };
    }

    return { mode: 'AI_TEXT_OK', texts };
  },

  buildTextOverlayPlan(
    brief: NormalizedGenerationBrief,
    _result: ProviderExecutionResult,
  ): ExactTextOverlayPlan | null {
    const detection = this.detectExactTextNeed(brief);

    if (detection.texts.length === 0) return null;

    return {
      texts: detection.texts.map((text, i) => ({
        content: text,
        role: this.inferTextRole(text, i),
        priority: detection.texts.length - i,
      })),
      mode: detection.mode,
    };
  },

  inferTextRole(
    text: string,
    index: number,
  ): 'headline' | 'subheadline' | 'cta' | 'price' | 'contact' | 'other' {
    if (/\d{4,}\s*(?:fcfa|€|xof|\$|cfa)/i.test(text)) return 'price';
    if (/\+?\d[\d\s.-]{6,}/.test(text)) return 'contact';
    if (/(?:commander|d[ée]couvrir|acheter|en\s*savoir|cliqu)/i.test(text)) return 'cta';
    if (/%|promo|offre|r[ée]duction/i.test(text)) return 'cta';
    if (index === 0) return 'headline';
    if (index === 1) return 'subheadline';
    return 'other';
  },
};
