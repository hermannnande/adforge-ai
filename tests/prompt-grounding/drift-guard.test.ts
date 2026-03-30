import { describe, it, expect } from 'vitest';
import { driftGuardService } from '@/server/services/prompt-grounding/drift-guard.service';
import type { ProjectMemorySnapshot } from '@/server/services/prompt-grounding/types';

const baseMemory: ProjectMemorySnapshot = {
  projectTheme: 'santé',
  projectGoal: 'créer une affiche publicitaire réaliste pour ma crème',
  preferredOutputType: 'poster',
  approvedStyleDirection: 'réaliste',
  lockedProductReferences: ['crème anti-verrues'],
  lockedBrandHints: [],
  lockedVisualIntent: null,
  conversationSummary: 'projet affiche crème santé',
  lastAcceptedDirection: 'réaliste',
  activeMarketingGoal: 'promouvoir le produit',
};

describe('DriftGuardService', () => {
  it('detects delta requests (minor modifications)', () => {
    const result = driftGuardService.analyzeDrift({
      latestPrompt: 'ajoute une femme noire élégante',
      projectMemory: baseMemory,
    });
    expect(result.isDelta).toBe(true);
    expect(result.isDrift).toBe(false);
  });

  it('detects explicit direction changes', () => {
    const result = driftGuardService.analyzeDrift({
      latestPrompt: 'maintenant je veux un flyer restaurant',
      projectMemory: baseMemory,
    });
    expect(result.isNewDirection).toBe(true);
    expect(result.isDrift).toBe(true);
  });

  it('keeps context for "garde" instructions', () => {
    const result = driftGuardService.analyzeDrift({
      latestPrompt: 'garde mon produit visible en grand',
      projectMemory: baseMemory,
    });
    expect(result.isDelta).toBe(true);
    expect(result.isDrift).toBe(false);
  });

  it('treats new prompts within same theme as non-drift', () => {
    const result = driftGuardService.analyzeDrift({
      latestPrompt: 'crée une bannière web pour ce médicament',
      projectMemory: baseMemory,
    });
    expect(result.isDrift).toBe(false);
  });
});
