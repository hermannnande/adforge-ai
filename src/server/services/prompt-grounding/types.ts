// ─── Asset roles for multi-image handling ────────────────────────────────────

export type AssetRole =
  | 'PRIMARY_PRODUCT'
  | 'SECONDARY_PRODUCT'
  | 'BRAND_REFERENCE'
  | 'STYLE_REFERENCE'
  | 'MODEL_REFERENCE'
  | 'PACKAGING_REFERENCE'
  | 'TEXT_REFERENCE'
  | 'LAYOUT_REFERENCE'
  | 'BACKGROUND_REFERENCE'
  | 'MOOD_REFERENCE';

export interface ClassifiedAsset {
  id: string;
  url: string;
  role: AssetRole;
  roleConfidence: number;
  visualSummary: string;
  objectSummary: string;
  colorSummary: string;
  productImportanceScore: number;
  styleImportanceScore: number;
  identityPreservationScore: number;
  isDataUrl: boolean;
}

export interface AssetCollection {
  assets: ClassifiedAsset[];
  primaryProduct: ClassifiedAsset | null;
  secondaryProducts: ClassifiedAsset[];
  styleReferences: ClassifiedAsset[];
  brandReferences: ClassifiedAsset[];
  otherReferences: ClassifiedAsset[];
  totalCount: number;
  analyzedCount: number;
  usedCount: number;
}

// ─── Preserved prompt structure ──────────────────────────────────────────────

export interface PreservedPrompt {
  rawUserPrompt: string;
  normalizedPrompt: string;
  coreIntent: string;
  detectedLanguage: 'fr' | 'en' | 'other';
  isRetouchRequest: boolean;
  isDeltaRequest: boolean;
}

// ─── Canonical request ───────────────────────────────────────────────────────

export interface CanonicalRequest {
  primaryInstruction: string;
  projectContext: ProjectMemorySnapshot;
  referenceAssets: AssetCollection;
  lockedConstraints: LockedConstraints;
  outputRequirements: OutputRequirements;
}

export interface ProjectMemorySnapshot {
  projectTheme: string | null;
  projectGoal: string | null;
  preferredOutputType: string | null;
  approvedStyleDirection: string | null;
  lockedProductReferences: string[];
  lockedBrandHints: string[];
  lockedVisualIntent: string | null;
  conversationSummary: string;
  lastAcceptedDirection: string | null;
  activeMarketingGoal: string | null;
}

export interface LockedConstraints {
  mustPreserveProduct: boolean;
  mustPreserveStyle: boolean;
  mustPreserveTone: boolean;
  lockedElements: string[];
  requestedChanges: string[];
}

export interface OutputRequirements {
  targetPlatform: string;
  targetFormat: string;
  aspectRatio: string;
  qualityMode: string;
  outputType: 'poster' | 'banner' | 'flyer' | 'social_ad' | 'product_shot' | 'generic_ad';
}

// ─── Enriched prompt (minimal) ───────────────────────────────────────────────

export interface MinimalEnrichedPrompt {
  finalPrompt: string;
  rawUserPrompt: string;
  contextAdditions: string[];
  imageInstructions: string[];
  qualityHints: string[];
}

// ─── Provider-specific translated prompt ─────────────────────────────────────

export interface ProviderTranslatedPrompt {
  mainPrompt: string;
  rawUserPrompt: string;
  referenceImages: string[];
  referenceImageRoles: Map<string, AssetRole>;
  imageCount: number;
  provider: string;
  translationNotes: string[];
}

// ─── Generation audit log ────────────────────────────────────────────────────

export interface GenerationAuditLog {
  rawUserPrompt: string;
  canonicalPrimaryInstruction: string;
  finalProviderPrompt: string;
  numberOfAssetsReceived: number;
  numberOfAssetsAnalyzed: number;
  numberOfAssetsUsed: number;
  assetUsageReasoning: string[];
  providerName: string;
  projectTheme: string | null;
  driftDetected: boolean;
  driftAction: string | null;
  finalPromptLength: number;
  promptTransformationSummary: string;
  timestamp: string;
}

// ─── Drift detection ─────────────────────────────────────────────────────────

export interface DriftAnalysis {
  isDrift: boolean;
  isDelta: boolean;
  isNewDirection: boolean;
  confidence: number;
  reason: string;
  mergedInstruction: string;
}
