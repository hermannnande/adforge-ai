import { describe, it, expect } from 'vitest';
import { requestUnderstandingService } from '@/server/services/ai/request-understanding.service';
import { GenerationTaskType, TextRequirementMode, QualityModeEnum } from '@/lib/ai/enums';

describe('RequestUnderstandingService', () => {
  describe('analyzeRequest', () => {
    it('classifies photorealistic request and sets FLUX-favorable flags', () => {
      const brief = requestUnderstandingService.analyzeRequest({
        prompt: 'Photo ultra réaliste d\'un parfum en studio',
        projectId: 'p1',
      });

      expect(brief.taskType).toBe(GenerationTaskType.PHOTOREALISTIC_AD);
      expect(brief.needPhotorealism).toBe(true);
      expect(brief.realismLevel).toBe('high');
    });

    it('classifies poster with text and sets Ideogram-favorable flags', () => {
      const brief = requestUnderstandingService.analyzeRequest({
        prompt: 'Crée une affiche avec gros texte "SOLDES -50%"',
        projectId: 'p1',
      });

      expect(brief.taskType).toBe(GenerationTaskType.POSTER_TEXT_HEAVY);
      expect(brief.needVisibleText).toBe(true);
      expect(brief.needExactText).toBe(true);
      expect(brief.providedExactText).toContain('SOLDES -50%');
      expect(brief.textRequirementMode).toBe(TextRequirementMode.EXACT);
    });

    it('detects product category from prompt', () => {
      const brief = requestUnderstandingService.analyzeRequest({
        prompt: 'Publicité pour mes sneakers Nike Jordan',
        projectId: 'p1',
      });

      expect(brief.productCategory).toBe('mode');
    });

    it('respects quality mode override', () => {
      const brief = requestUnderstandingService.analyzeRequest({
        prompt: 'Simple pub',
        projectId: 'p1',
        qualityMode: 'PREMIUM',
      });

      expect(brief.qualityMode).toBe(QualityModeEnum.PREMIUM);
    });

    it('detects multi-reference scenario', () => {
      const brief = requestUnderstandingService.analyzeRequest({
        prompt: 'Garde la cohérence entre ces images',
        projectId: 'p1',
        referenceImageIds: ['img1', 'img2'],
      });

      expect(brief.referenceAssetCount).toBe(2);
    });

    it('generates FLUX-safe translated constraints', () => {
      const brief = requestUnderstandingService.analyzeRequest({
        prompt: 'pub simple',
        projectId: 'p1',
      });

      expect(brief.translatedConstraintsForFlux.length).toBeGreaterThan(0);
      expect(brief.translatedConstraintsForFlux[0]).not.toContain('no ');
    });

    it('detects platform from prompt', () => {
      const brief = requestUnderstandingService.analyzeRequest({
        prompt: 'pub pour Instagram Story',
        projectId: 'p1',
      });

      expect(brief.platform).toBe('instagram_story');
    });

    it('passes exact texts from input', () => {
      const brief = requestUnderstandingService.analyzeRequest({
        prompt: 'Affiche pour mon resto',
        projectId: 'p1',
        exactTexts: ['Ouvert 7j/7', '+225 01 02 03 04'],
      });

      expect(brief.needExactText).toBe(true);
      expect(brief.providedExactText).toContain('Ouvert 7j/7');
      expect(brief.providedExactText).toContain('+225 01 02 03 04');
    });
  });
});
