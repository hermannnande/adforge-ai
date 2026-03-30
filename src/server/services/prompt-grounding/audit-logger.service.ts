import type {
  CanonicalRequest,
  MinimalEnrichedPrompt,
  GenerationAuditLog,
} from './types';

export const auditLoggerService = {
  buildLog(params: {
    canonical: CanonicalRequest;
    enriched: MinimalEnrichedPrompt;
    finalProviderPrompt: string;
    providerName: string;
    driftDetected: boolean;
    driftAction: string | null;
  }): GenerationAuditLog {
    const { canonical, enriched, finalProviderPrompt, providerName, driftDetected, driftAction } = params;

    const log: GenerationAuditLog = {
      rawUserPrompt: canonical.primaryInstruction,
      canonicalPrimaryInstruction: canonical.primaryInstruction,
      finalProviderPrompt: finalProviderPrompt.slice(0, 2000),
      numberOfAssetsReceived: canonical.referenceAssets.totalCount,
      numberOfAssetsAnalyzed: canonical.referenceAssets.analyzedCount,
      numberOfAssetsUsed: canonical.referenceAssets.usedCount,
      assetUsageReasoning: canonical.referenceAssets.assets.map(
        (a) => `[${a.role}] ${a.id} (confidence: ${a.roleConfidence.toFixed(2)})`,
      ),
      providerName,
      projectTheme: canonical.projectContext.projectTheme,
      driftDetected,
      driftAction,
      finalPromptLength: finalProviderPrompt.length,
      promptTransformationSummary: buildTransformationSummary(
        canonical.primaryInstruction,
        finalProviderPrompt,
        enriched,
      ),
      timestamp: new Date().toISOString(),
    };

    console.log('[GenerationAudit]', JSON.stringify({
      rawPrompt: log.rawUserPrompt.slice(0, 100),
      provider: log.providerName,
      assetsReceived: log.numberOfAssetsReceived,
      assetsUsed: log.numberOfAssetsUsed,
      driftDetected: log.driftDetected,
      promptLen: log.finalPromptLength,
      theme: log.projectTheme,
    }));

    return log;
  },
};

function buildTransformationSummary(
  raw: string,
  final: string,
  enriched: MinimalEnrichedPrompt,
): string {
  const additions = [
    ...enriched.contextAdditions,
    ...enriched.imageInstructions,
    ...enriched.qualityHints,
  ];
  const ratio = raw.length > 0 ? (final.length / raw.length).toFixed(1) : '0';
  return `User prompt preserved. ${additions.length} context additions. Final/Raw ratio: ${ratio}x.`;
}
