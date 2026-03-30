import { ProviderName, ProviderHealthStatus } from '@/lib/ai/enums';
import type { ProviderHealthSnapshot } from '@/lib/ai/types';

const FAILURE_THRESHOLD_DEGRADED = 3;
const FAILURE_THRESHOLD_OPEN = 5;
const CIRCUIT_OPEN_DURATION_MS = 3 * 60 * 1000; // 3 minutes
const LATENCY_WINDOW = 20;

interface ProviderHealthState {
  consecutiveFailures: number;
  lastFailureAt: number | null;
  lastSuccessAt: number | null;
  circuitOpenUntil: number | null;
  recentLatencies: number[];
}

const state = new Map<ProviderName, ProviderHealthState>();

function getState(provider: ProviderName): ProviderHealthState {
  if (!state.has(provider)) {
    state.set(provider, {
      consecutiveFailures: 0,
      lastFailureAt: null,
      lastSuccessAt: null,
      circuitOpenUntil: null,
      recentLatencies: [],
    });
  }
  return state.get(provider)!;
}

function computeStatus(s: ProviderHealthState): ProviderHealthStatus {
  const now = Date.now();

  if (s.circuitOpenUntil && now < s.circuitOpenUntil) {
    return ProviderHealthStatus.CIRCUIT_OPEN;
  }

  if (s.circuitOpenUntil && now >= s.circuitOpenUntil) {
    return ProviderHealthStatus.RECOVERING;
  }

  if (s.consecutiveFailures >= FAILURE_THRESHOLD_OPEN) {
    return ProviderHealthStatus.CIRCUIT_OPEN;
  }

  if (s.consecutiveFailures >= FAILURE_THRESHOLD_DEGRADED) {
    return ProviderHealthStatus.DEGRADED;
  }

  return ProviderHealthStatus.HEALTHY;
}

function avgLatency(latencies: number[]): number {
  if (latencies.length === 0) return 0;
  return Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
}

export const providerHealthService = {
  recordSuccess(provider: ProviderName, latencyMs: number): void {
    const s = getState(provider);
    s.consecutiveFailures = 0;
    s.lastSuccessAt = Date.now();
    s.circuitOpenUntil = null;
    s.recentLatencies.push(latencyMs);
    if (s.recentLatencies.length > LATENCY_WINDOW) {
      s.recentLatencies.shift();
    }
  },

  recordFailure(provider: ProviderName, error: string): void {
    const s = getState(provider);
    s.consecutiveFailures += 1;
    s.lastFailureAt = Date.now();

    if (s.consecutiveFailures >= FAILURE_THRESHOLD_OPEN && !s.circuitOpenUntil) {
      s.circuitOpenUntil = Date.now() + CIRCUIT_OPEN_DURATION_MS;
      console.warn(
        `[ProviderHealth] Circuit OPEN for ${provider} — ` +
        `${s.consecutiveFailures} consecutive failures. ` +
        `Last error: ${error.slice(0, 200)}`,
      );
    }
  },

  getHealth(provider: ProviderName): ProviderHealthSnapshot {
    const s = getState(provider);
    return {
      provider,
      status: computeStatus(s),
      consecutiveFailures: s.consecutiveFailures,
      lastFailureAt: s.lastFailureAt,
      lastSuccessAt: s.lastSuccessAt,
      avgLatencyMs: avgLatency(s.recentLatencies),
      circuitOpenUntil: s.circuitOpenUntil,
    };
  },

  isAvailableForRouting(provider: ProviderName): boolean {
    const status = computeStatus(getState(provider));
    return (
      status === ProviderHealthStatus.HEALTHY ||
      status === ProviderHealthStatus.DEGRADED ||
      status === ProviderHealthStatus.RECOVERING
    );
  },

  getAllHealth(): Map<ProviderName, ProviderHealthSnapshot> {
    const result = new Map<ProviderName, ProviderHealthSnapshot>();
    for (const name of Object.values(ProviderName)) {
      result.set(name, this.getHealth(name));
    }
    return result;
  },

  reset(provider: ProviderName): void {
    state.delete(provider);
  },

  resetAll(): void {
    state.clear();
  },
};
