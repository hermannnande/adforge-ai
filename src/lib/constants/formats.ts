export const ASPECT_RATIOS = {
  '1:1': { width: 1, height: 1, label: 'Carré (1:1)' },
  '4:5': { width: 4, height: 5, label: 'Portrait (4:5)' },
  '9:16': { width: 9, height: 16, label: 'Story (9:16)' },
  '16:9': { width: 16, height: 9, label: 'Paysage (16:9)' },
  '3:4': { width: 3, height: 4, label: 'Print (3:4)' },
} as const;

export type AspectRatio = keyof typeof ASPECT_RATIOS;

export const EXPORT_FORMATS = ['PNG', 'JPG', 'WEBP', 'PDF'] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export const QUALITY_MODES = {
  DRAFT: { label: 'Draft', description: 'Rapide, basse résolution', credits: 1 },
  STANDARD: { label: 'Standard', description: 'Bonne qualité, résolution HD', credits: 2 },
  PREMIUM: { label: 'Premium', description: 'Qualité maximale, ultra-détaillé', credits: 5 },
} as const;

export type QualityMode = keyof typeof QUALITY_MODES;
