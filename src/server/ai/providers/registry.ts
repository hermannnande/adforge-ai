import { OpenAiProvider } from './openai.provider';
import { ReplicateProvider } from './replicate.provider';
import type { AiProvider } from './types';

class AiProviderRegistry {
  private providers = new Map<string, AiProvider>();

  register(provider: AiProvider): void {
    this.providers.set(provider.name, provider);
  }

  get(name: string): AiProvider {
    const provider = this.providers.get(name);
    if (!provider) throw new Error(`AI provider "${name}" not registered`);
    return provider;
  }

  getAvailable(): AiProvider[] {
    return Array.from(this.providers.values()).filter((p) => p.isAvailable());
  }

  getDefaultTextProvider(): AiProvider {
    const openai = this.providers.get('openai');
    if (openai?.isAvailable()) return openai;
    throw new Error('No text generation provider available');
  }

  getDefaultImageProvider(): AiProvider {
    const replicate = this.providers.get('replicate');
    if (replicate?.isAvailable()) return replicate;
    const openai = this.providers.get('openai');
    if (openai?.isAvailable()) return openai;
    throw new Error('No image generation provider available');
  }
}

export const aiRegistry = new AiProviderRegistry();

aiRegistry.register(new OpenAiProvider());
aiRegistry.register(new ReplicateProvider());
