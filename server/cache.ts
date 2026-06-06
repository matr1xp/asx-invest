// server/cache.ts
interface Entry<T> { value: T; expires: number; }

export interface TtlCacheOptions {
  maxSize?: number;
}

export class TtlCache<T> {
  private store = new Map<string, Entry<T>>();
  private readonly maxSize: number;

  constructor(private ttlMs: number, options: TtlCacheOptions = {}) {
    this.maxSize = options.maxSize ?? 500;
  }

  get(key: string): T | undefined {
    const e = this.store.get(key);
    if (!e) return undefined;
    if (Date.now() > e.expires) { this.store.delete(key); return undefined; }
    return e.value;
  }

  set(key: string, value: T): void {
    if (!this.store.has(key) && this.store.size >= this.maxSize) {
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) this.store.delete(oldest);
    }
    this.store.set(key, { value, expires: Date.now() + this.ttlMs });
  }

  async getOrFetch(key: string, fetcher: () => Promise<T>): Promise<T> {
    const hit = this.get(key);
    if (hit !== undefined) return hit;
    const value = await fetcher();
    this.set(key, value);
    return value;
  }
}
