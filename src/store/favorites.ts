const KEY = 'asx-favorites';

export function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s: unknown) => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

export function saveFavorites(symbols: string[]): void {
  localStorage.setItem(KEY, JSON.stringify(symbols));
}

export function toggleFavorite(symbol: string, current: string[]): string[] {
  return current.includes(symbol)
    ? current.filter((s) => s !== symbol)
    : [...current, symbol];
}

export function isFavorite(symbol: string, favorites: string[]): boolean {
  return favorites.includes(symbol);
}