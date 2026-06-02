import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TtlCache } from './cache';

describe('TtlCache', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns a cached value before TTL expires', () => {
    const cache = new TtlCache<number>(1000);
    cache.set('k', 42);
    expect(cache.get('k')).toBe(42);
  });

  it('returns undefined after TTL expires', () => {
    const cache = new TtlCache<number>(1000);
    cache.set('k', 42);
    vi.advanceTimersByTime(1001);
    expect(cache.get('k')).toBeUndefined();
  });

  it('getOrFetch caches the resolved value', async () => {
    const cache = new TtlCache<number>(1000);
    const fetcher = vi.fn().mockResolvedValue(7);
    expect(await cache.getOrFetch('k', fetcher)).toBe(7);
    expect(await cache.getOrFetch('k', fetcher)).toBe(7);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
