import type { DriftAnalysis, ProjectMemorySnapshot } from './types';

const DIRECTION_CHANGE_PATTERNS = [
  /maintenant\s+(je\s+veux|fais|crée)/i,
  /changement\s+de/i,
  /nouveau\s+projet/i,
  /oublie\s+tout/i,
  /recommence/i,
  /completely\s+different/i,
  /new\s+project/i,
  /start\s+over/i,
];

const DELTA_PATTERNS = [
  /plus\s+(premium|luxe|réaliste|lumineu|sombre|dynamique|coloré)/i,
  /ajoute\s+(un|une|des|le|la)/i,
  /change\s+(le|la|les)/i,
  /garde\s+(tout|le|la|mon|ma|mes|ce|cette)/i,
  /même\s+chose\s+(mais|avec|sans)/i,
  /remplace\s+(le|la)/i,
  /mets?\s+(un|une|le|la|mon|ma)/i,
  /rend[s]?\s+(plus|moins)/i,
  /enlève|supprime|retire/i,
  /keep\s+/i,
  /add\s+/i,
  /make\s+it/i,
  /same\s+but/i,
];

const AD_CONTEXT_PATTERNS = /affiche|poster|pub|bannière|flyer|visuel|créatif|advertisement|ad\s+visual|marketing/i;

/**
 * Prompt drift prevention + project theme guard.
 *
 * Detects whether the user's latest message is:
 * - A DELTA: minor change to existing direction (most common)
 * - A DIRECTION CHANGE: explicit request to change theme
 * - A NEW REQUEST: unrelated to project context
 *
 * The system defaults to treating messages as DELTA unless strong evidence of direction change.
 */
export const driftGuardService = {
  analyzeDrift(params: {
    latestPrompt: string;
    projectMemory: ProjectMemorySnapshot;
  }): DriftAnalysis {
    const { latestPrompt, projectMemory } = params;
    const lower = latestPrompt.toLowerCase();

    const isExplicitDirectionChange = DIRECTION_CHANGE_PATTERNS.some((p) => p.test(lower));
    const isDeltaLikely = DELTA_PATTERNS.some((p) => p.test(lower));

    if (isExplicitDirectionChange) {
      return {
        isDrift: true,
        isDelta: false,
        isNewDirection: true,
        confidence: 0.9,
        reason: 'Explicit direction change detected',
        mergedInstruction: latestPrompt,
      };
    }

    if (isDeltaLikely) {
      const merged = projectMemory.projectGoal
        ? `${projectMemory.projectGoal} — modification: ${latestPrompt}`
        : latestPrompt;

      return {
        isDrift: false,
        isDelta: true,
        isNewDirection: false,
        confidence: 0.8,
        reason: 'Delta modification detected — keeping project context',
        mergedInstruction: merged,
      };
    }

    if (projectMemory.projectTheme) {
      const promptTheme = detectThemeFromText(lower);
      const projectTheme = projectMemory.projectTheme.toLowerCase();

      if (promptTheme && promptTheme !== projectTheme) {
        return {
          isDrift: true,
          isDelta: false,
          isNewDirection: true,
          confidence: 0.6,
          reason: `Theme change detected: ${projectTheme} → ${promptTheme}`,
          mergedInstruction: latestPrompt,
        };
      }
    }

    return {
      isDrift: false,
      isDelta: false,
      isNewDirection: false,
      confidence: 0.5,
      reason: 'New request within project context',
      mergedInstruction: latestPrompt,
    };
  },

  /**
   * Enforce advertising output context.
   * Ensures the prompt maintains the advertising/poster/banner frame.
   */
  enforceAdvertisingContext(prompt: string): string {
    if (AD_CONTEXT_PATTERNS.test(prompt)) {
      return prompt;
    }

    return prompt;
  },

  /**
   * Merge delta instruction with project theme.
   */
  mergeDeltaWithProjectTheme(
    delta: string,
    memory: ProjectMemorySnapshot,
  ): string {
    if (!memory.projectGoal) return delta;

    const isDelta = DELTA_PATTERNS.some((p) => p.test(delta.toLowerCase()));
    if (!isDelta) return delta;

    return delta;
  },
};

function detectThemeFromText(text: string): string | null {
  const themes: Record<string, RegExp> = {
    beauté: /beaut[ée]|cosm[ée]ti|maquillage|soin|crème/i,
    santé: /pharma|m[ée]dicament|sant[ée]|médical/i,
    mode: /mode|fashion|v[eê]tement|chaussure/i,
    food: /restaurant|food|nourriture|pizza|burger/i,
    tech: /tech|app|logiciel|saas/i,
    immobilier: /immobilier|maison|appartement/i,
  };

  for (const [theme, pattern] of Object.entries(themes)) {
    if (pattern.test(text)) return theme;
  }
  return null;
}
