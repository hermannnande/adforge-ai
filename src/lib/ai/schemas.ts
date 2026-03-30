import { z } from 'zod';
import { GenerationTaskType, QualityModeEnum, TextRequirementMode } from './enums';

export const normalizedBriefSchema = z.object({
  rawUserPrompt: z.string(),
  cleanedPrompt: z.string(),
  taskType: z.nativeEnum(GenerationTaskType),

  productName: z.string().optional(),
  productCategory: z.string().optional(),
  objective: z.string().optional(),
  targetAudience: z.string().optional(),
  platform: z.string().optional(),
  format: z.string().optional(),
  aspectRatio: z.string().optional(),
  language: z.string().optional(),

  textNeedLevel: z.enum(['low', 'medium', 'high']),
  textRequirementMode: z.nativeEnum(TextRequirementMode),
  providedExactText: z.array(z.string()),

  realismLevel: z.enum(['low', 'medium', 'high']),
  styleIntent: z.array(z.string()),

  needVisibleText: z.boolean(),
  needExactText: z.boolean(),
  needPhotorealism: z.boolean(),
  needProductFocus: z.boolean(),
  needPosterStyle: z.boolean(),
  needTypographyQuality: z.boolean(),

  referenceAssetCount: z.number().int().min(0),
  referenceAssetIds: z.array(z.string()),

  brandKitId: z.string().optional(),
  projectId: z.string().optional(),
  conversationId: z.string().optional(),
  historicalProjectContext: z.array(z.string()),

  positiveConstraints: z.array(z.string()),
  negativeConstraintsRaw: z.array(z.string()),
  translatedConstraintsForFlux: z.array(z.string()),

  qualityMode: z.nativeEnum(QualityModeEnum),
});

export const generateRequestSchema = z.object({
  prompt: z.string().min(1),
  projectId: z.string(),
  conversationId: z.string().optional(),
  qualityMode: z.nativeEnum(QualityModeEnum).default(QualityModeEnum.STANDARD),
  platform: z.string().optional(),
  providerOverride: z.enum(['openai', 'flux', 'ideogram']).optional(),
  referenceImageIds: z.array(z.string()).default([]),
  brandKitId: z.string().optional(),
  aspectRatio: z.string().optional(),
  exactTexts: z.array(z.string()).default([]),
});

export type GenerateRequestInput = z.infer<typeof generateRequestSchema>;
