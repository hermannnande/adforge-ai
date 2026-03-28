export const PLATFORMS = {
  FACEBOOK_ADS: { label: 'Facebook Ads', ratio: '1:1', width: 1080, height: 1080 },
  INSTAGRAM_FEED: { label: 'Instagram Feed', ratio: '4:5', width: 1080, height: 1350 },
  INSTAGRAM_STORY: { label: 'Instagram Story', ratio: '9:16', width: 1080, height: 1920 },
  TIKTOK_ADS: { label: 'TikTok Ads', ratio: '9:16', width: 1080, height: 1920 },
  WHATSAPP_STATUS: { label: 'WhatsApp Status', ratio: '9:16', width: 1080, height: 1920 },
  BANNER_WEB: { label: 'Bannière Web', ratio: '16:9', width: 1920, height: 1080 },
  FLYER_PRINT: { label: 'Flyer Impression', ratio: '3:4', width: 2480, height: 3508 },
} as const;

export type PlatformKey = keyof typeof PLATFORMS;
