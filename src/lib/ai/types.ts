import type {
  ProviderName,
  GenerationTaskType,
  ProviderHealthStatus,
  QualityModeEnum,
  TextRequirementMode,
} from './enums';

// ---------------------------------------------------------------------------
// Brief
// ---------------------------------------------------------------------------

export interface NormalizedGenerationBrief {
  rawUserPrompt: string;
  cleanedPrompt: string;
  taskType: GenerationTaskType;

  productName?: string;
  productCategory?: string;
  objective?: string;
  targetAudience?: string;
  platform?: string;
  format?: string;
  aspectRatio?: string;
  language?: string;

  textNeedLevel: 'low' | 'medium' | 'high';
  textRequirementMode: TextRequirementMode;
  providedExactText: string[];

  realismLevel: 'low' | 'medium' | 'high';
  styleIntent: string[];

  needVisibleText: boolean;
  needExactText: boolean;
  needPhotorealism: boolean;
  needProductFocus: boolean;
  needPosterStyle: boolean;
  needTypographyQuality: boolean;

  referenceAssetCount: number;
  referenceAssetIds: string[];

  brandKitId?: string;
  projectId?: string;
  conversationId?: string;
  historicalProjectContext: string[];

  positiveConstraints: string[];
  negativeConstraintsRaw: string[];
  translatedConstraintsForFlux: string[];

  qualityMode: QualityModeEnum;
}

// ---------------------------------------------------------------------------
// Provider capabilities
// ---------------------------------------------------------------------------

export interface ProviderCapabilityProfile {
  name: ProviderName;
  generalistScore: number;
  photorealismScore: number;
  typographyScore: number;
  posterScore: number;
  editScore: number;
  multiReferenceScore: number;
  async: boolean;
  supportsNegativePrompt: boolean;
  supportsExactTextReliability: 'low' | 'medium' | 'high';
  temporaryAssetUrl: boolean;
  maxConcurrent: number;
}

// ---------------------------------------------------------------------------
// Provider health
// ---------------------------------------------------------------------------

export interface ProviderHealthSnapshot {
  provider: ProviderName;
  status: ProviderHealthStatus;
  consecutiveFailures: number;
  lastFailureAt: number | null;
  lastSuccessAt: number | null;
  avgLatencyMs: number;
  circuitOpenUntil: number | null;
}

// ---------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------

export interface RoutingDecision {
  provider: ProviderName;
  taskType: GenerationTaskType;
  scores: ProviderScore[];
  reason: string[];
  fallbackChain: ProviderName[];
  estimatedCost: number;
}

export interface ProviderScore {
  provider: ProviderName;
  capabilityFit: number;
  healthScore: number;
  contextFit: number;
  historicalSuccess: number;
  latencyScore: number;
  costPenalty: number;
  riskPenalty: number;
  total: number;
}

export type RoutingDecisionReason = string;

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

export interface PromptPackage {
  mainPrompt: string;
  negativePrompt?: string;
  editInstruction?: string;
  layoutGuidance?: string;
  textHandlingMode: TextRequirementMode;
  generationNotes: string[];
  providerWarnings: string[];
  exactTextOverlayPlan?: ExactTextOverlayPlan;
  metadata: Record<string, unknown>;
}

export interface ExactTextOverlayPlan {
  texts: Array<{
    content: string;
    role: 'headline' | 'subheadline' | 'cta' | 'price' | 'contact' | 'other';
    priority: number;
  }>;
  mode: 'AI_TEXT_OK' | 'DETERMINISTIC_TEXT_REQUIRED';
}

// ---------------------------------------------------------------------------
// Execution
// ---------------------------------------------------------------------------

export interface ProviderExecutionContext {
  provider: ProviderName;
  promptPackage: PromptPackage;
  brief: NormalizedGenerationBrief;
  size: { width: number; height: number };
  quality: 'draft' | 'standard' | 'premium';
  referenceImages?: string[];
}

export interface ProviderExecutionResult {
  images: Array<{
    url: string;
    width: number;
    height: number;
    base64?: string;
  }>;
  model: string;
  provider: ProviderName;
  durationMs: number;
  costEstimate?: number;
}

// ---------------------------------------------------------------------------
// Quality
// ---------------------------------------------------------------------------

export interface QualityEvaluationResult {
  briefAlignmentScore: number;
  realismScore: number;
  typographyScore: number;
  productFocusScore: number;
  compositionScore: number;
  brandConsistencyScore: number;
  finalQualityScore: number;
  issues: string[];
  passesThreshold: boolean;
}

// ---------------------------------------------------------------------------
// Consistency
// ---------------------------------------------------------------------------

export interface ConsistencyProfile {
  projectId: string;
  bestProvider: ProviderName | null;
  dominantStyle: string | null;
  dominantPalette: string[];
  dominantRatio: string | null;
  dominantTone: string | null;
  frequentModel: string | null;
  topConstraints: string[];
  generationCount: number;
}

// ---------------------------------------------------------------------------
// Retry / Fallback
// ---------------------------------------------------------------------------

export interface RetryPlan {
  shouldRetry: boolean;
  sameProvider: boolean;
  modifiedPrompt: boolean;
  reason: string;
}

export interface FallbackPlan {
  provider: ProviderName;
  reason: string;
  recompiledPrompt: boolean;
}

// ---------------------------------------------------------------------------
// Project context
// ---------------------------------------------------------------------------

export interface ProjectContext {
  projectId: string;
  projectName: string;
  settings: {
    platform?: string;
    aspectRatio?: string;
    qualityMode?: string;
    language?: string;
    objective?: string;
    style?: string;
    tone?: string;
    productName?: string;
    productCategory?: string;
    targetAudience?: string;
  };
  brandKit?: {
    id: string;
    name: string;
    brandName?: string;
    slogan?: string;
    primaryColors: string[];
    secondaryColors: string[];
    forbiddenColors: string[];
    fonts: string[];
    tone?: string;
    marketingPromise?: string;
    preferredCTAs: string[];
    forbiddenWords: string[];
  };
  recentGenerations: Array<{
    provider: string | null;
    model: string | null;
    qualityMode: string;
    prompt: string | null;
  }>;
  consistencyHints: ConsistencyProfile | null;
}

// ---------------------------------------------------------------------------
// Telemetry
// ---------------------------------------------------------------------------

export interface RoutingTelemetryEntry {
  brief: NormalizedGenerationBrief;
  decision: RoutingDecision;
  quality: QualityEvaluationResult | null;
  executionResult: ProviderExecutionResult | null;
  fallbackUsed: boolean;
  fallbackProvider?: ProviderName;
  totalDurationMs: number;
  projectId: string;
  conversationId?: string;
  timestamp: number;
}
