import type { PreservedPrompt } from './types';

const DELTA_PATTERNS = [
  /plus\s+(premium|luxe|réaliste|lumineu|sombre|dynamique|coloré)/i,
  /ajoute\s+(un|une|des|le|la)/i,
  /change\s+(le|la|les)/i,
  /garde\s+(tout|le|la)/i,
  /même\s+chose\s+(mais|avec|sans)/i,
  /remplace\s+(le|la)/i,
  /mets?\s+(un|une|le|la|mon|ma)/i,
  /rend[s]?\s+(plus|moins)/i,
  /enlève|supprime|retire/i,
  /keep\s+(the|everything)/i,
  /add\s+(a|an|the|some)/i,
  /make\s+it\s+(more|less)/i,
  /same\s+but/i,
];

const RETOUCH_PATTERNS = [
  /retouche/i,
  /modifi(e|er)/i,
  /am[ée]lior(e|er)/i,
  /corrig(e|er)/i,
  /\[retouche/i,
];

/**
 * Strip ONLY the synthetic markers injected by the frontend.
 * Never strip the user's actual words.
 */
function stripFrontendMarkers(raw: string): string {
  return raw
    .replace(/\[Retouche sur image existante\]\s*/i, '')
    .replace(/\n\n\[\d+ image\(s\) de référence[^\]]*\]/gi, '')
    .trim();
}

function detectLanguage(text: string): 'fr' | 'en' | 'other' {
  const frPatterns = /\b(une?|des?|pour|avec|dans|mon|ma|mes|crée|affiche|produit|poster|visuel)\b/i;
  const enPatterns = /\b(the|a|an|for|with|create|make|generate|poster|product)\b/i;
  const frScore = (text.match(frPatterns) || []).length;
  const enScore = (text.match(enPatterns) || []).length;
  if (frScore > enScore) return 'fr';
  if (enScore > frScore) return 'en';
  return 'fr';
}

/**
 * Light normalization: fix spacing, trim, but preserve meaning entirely.
 */
function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export const rawPromptService = {
  /**
   * Preserves the user's raw prompt, stripping only synthetic markers
   * added by the frontend. The core intent is NEVER modified.
   */
  preserveCoreIntent(rawInput: string): PreservedPrompt {
    const cleaned = stripFrontendMarkers(rawInput);
    const normalized = normalize(cleaned);
    const lang = detectLanguage(cleaned);
    const isDelta = DELTA_PATTERNS.some((p) => p.test(cleaned));
    const isRetouch = RETOUCH_PATTERNS.some((p) => p.test(rawInput));

    return {
      rawUserPrompt: cleaned,
      normalizedPrompt: normalized,
      coreIntent: normalized,
      detectedLanguage: lang,
      isRetouchRequest: isRetouch,
      isDeltaRequest: isDelta,
    };
  },

  /**
   * Validate that a transformation didn't destroy the user's intent.
   * Returns true if the transformed prompt still contains the core meaning.
   */
  validateTransformation(original: string, transformed: string): boolean {
    const origWords = new Set(
      original
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3),
    );
    const transWords = new Set(
      transformed
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3),
    );

    let preserved = 0;
    for (const w of origWords) {
      if (transWords.has(w)) preserved++;
    }

    const ratio = origWords.size > 0 ? preserved / origWords.size : 1;
    return ratio >= 0.5;
  },
};
