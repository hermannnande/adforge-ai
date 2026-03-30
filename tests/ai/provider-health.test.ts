import { describe, it, expect, beforeEach } from 'vitest';
import { providerHealthService } from '@/server/ai/providers/image/provider-health.service';
import { ProviderName, ProviderHealthStatus } from '@/lib/ai/enums';

describe('ProviderHealthService', () => {
  beforeEach(() => {
    providerHealthService.resetAll();
  });

  it('starts healthy', () => {
    const health = providerHealthService.getHealth(ProviderName.OPENAI);
    expect(health.status).toBe(ProviderHealthStatus.HEALTHY);
    expect(health.consecutiveFailures).toBe(0);
  });

  it('records success and resets failures', () => {
    providerHealthService.recordFailure(ProviderName.OPENAI, 'test');
    providerHealthService.recordFailure(ProviderName.OPENAI, 'test');
    providerHealthService.recordSuccess(ProviderName.OPENAI, 2000);
    const health = providerHealthService.getHealth(ProviderName.OPENAI);
    expect(health.status).toBe(ProviderHealthStatus.HEALTHY);
    expect(health.consecutiveFailures).toBe(0);
  });

  it('degrades after 3 failures', () => {
    providerHealthService.recordFailure(ProviderName.FLUX, 'err1');
    providerHealthService.recordFailure(ProviderName.FLUX, 'err2');
    providerHealthService.recordFailure(ProviderName.FLUX, 'err3');
    const health = providerHealthService.getHealth(ProviderName.FLUX);
    expect(health.status).toBe(ProviderHealthStatus.DEGRADED);
  });

  it('opens circuit after 5 failures', () => {
    for (let i = 0; i < 5; i++) {
      providerHealthService.recordFailure(ProviderName.IDEOGRAM, `err${i}`);
    }
    const health = providerHealthService.getHealth(ProviderName.IDEOGRAM);
    expect(health.status).toBe(ProviderHealthStatus.CIRCUIT_OPEN);
    expect(health.circuitOpenUntil).not.toBeNull();
  });

  it('is not available for routing when circuit is open', () => {
    for (let i = 0; i < 5; i++) {
      providerHealthService.recordFailure(ProviderName.OPENAI, `err${i}`);
    }
    expect(providerHealthService.isAvailableForRouting(ProviderName.OPENAI)).toBe(false);
  });

  it('tracks average latency', () => {
    providerHealthService.recordSuccess(ProviderName.FLUX, 5000);
    providerHealthService.recordSuccess(ProviderName.FLUX, 3000);
    const health = providerHealthService.getHealth(ProviderName.FLUX);
    expect(health.avgLatencyMs).toBe(4000);
  });

  it('resets a single provider', () => {
    providerHealthService.recordFailure(ProviderName.OPENAI, 'test');
    providerHealthService.reset(ProviderName.OPENAI);
    const health = providerHealthService.getHealth(ProviderName.OPENAI);
    expect(health.consecutiveFailures).toBe(0);
  });
});
