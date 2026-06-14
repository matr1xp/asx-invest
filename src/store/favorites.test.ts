import { describe, it, expect, beforeEach } from 'vitest';
import { loadFavorites, saveFavorites, toggleFavorite, isFavorite } from './favorites';

beforeEach(() => {
  localStorage.clear();
});

describe('favorites store', () => {
  it('loads empty array when nothing stored', () => {
    expect(loadFavorites()).toEqual([]);
  });
  it('saves and loads favorites', () => {
    saveFavorites(['VHY', 'VAS']);
    expect(loadFavorites()).toEqual(['VHY', 'VAS']);
  });
  it('toggles a symbol on', () => {
    expect(toggleFavorite('VAS', ['VHY'])).toEqual(['VHY', 'VAS']);
  });
  it('toggles a symbol off', () => {
    expect(toggleFavorite('VHY', ['VHY', 'VAS'])).toEqual(['VAS']);
  });
  it('checks if a symbol is favorite', () => {
    expect(isFavorite('VHY', ['VHY', 'VAS'])).toBe(true);
    expect(isFavorite('BHP', ['VHY', 'VAS'])).toBe(false);
  });
  it('handles corrupt localStorage gracefully', () => {
    localStorage.setItem('asx-favorites', '{bad json');
    expect(loadFavorites()).toEqual([]);
  });
});