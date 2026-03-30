import { describe, it, expect } from 'vitest';
import { rawPromptService } from '@/server/services/prompt-grounding/raw-prompt.service';

describe('RawPromptPreservationService', () => {
  it('preserves user prompt without modification', () => {
    const result = rawPromptService.preserveCoreIntent(
      'crée une affiche pub pro pour mon produit contre les verrues',
    );
    expect(result.rawUserPrompt).toBe(
      'crée une affiche pub pro pour mon produit contre les verrues',
    );
    expect(result.normalizedPrompt).toBe(
      'crée une affiche pub pro pour mon produit contre les verrues',
    );
  });

  it('strips frontend image reference markers', () => {
    const result = rawPromptService.preserveCoreIntent(
      'crée une affiche\n\n[2 image(s) de référence — générez un visuel cohérent avec ces images]',
    );
    expect(result.rawUserPrompt).toBe('crée une affiche');
  });

  it('strips retouche prefix', () => {
    const result = rawPromptService.preserveCoreIntent(
      '[Retouche sur image existante] ajoute une femme noire',
    );
    expect(result.rawUserPrompt).toBe('ajoute une femme noire');
    expect(result.isRetouchRequest).toBe(true);
  });

  it('detects delta requests', () => {
    expect(rawPromptService.preserveCoreIntent('ajoute une femme noire').isDeltaRequest).toBe(true);
    expect(rawPromptService.preserveCoreIntent('change le fond en noir').isDeltaRequest).toBe(true);
    expect(rawPromptService.preserveCoreIntent('garde tout mais plus lumineux').isDeltaRequest).toBe(true);
    expect(rawPromptService.preserveCoreIntent('même chose mais avec un logo').isDeltaRequest).toBe(true);
  });

  it('detects non-delta full requests', () => {
    expect(
      rawPromptService.preserveCoreIntent('crée une affiche publicitaire réaliste pour ma crème').isDeltaRequest,
    ).toBe(false);
  });

  it('detects French language', () => {
    const fr = rawPromptService.preserveCoreIntent('crée une affiche pour mon produit');
    expect(fr.detectedLanguage).toBe('fr');
  });

  it('validates transformation preserves intent', () => {
    const valid = rawPromptService.validateTransformation(
      'crée une affiche publicitaire réaliste pour ma crème',
      'professional advertising poster, crème product, réaliste, affiche publicitaire',
    );
    expect(valid).toBe(true);

    const invalid = rawPromptService.validateTransformation(
      'crée une affiche publicitaire réaliste pour ma crème',
      'pizza menu flyer design template',
    );
    expect(invalid).toBe(false);
  });
});
