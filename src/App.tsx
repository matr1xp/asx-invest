import { useState, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './features/dashboard/Dashboard';
import { Detail } from './features/detail/Detail';
import { Portfolio } from './features/portfolio/Portfolio';
import { Yields } from './features/yields/Yields';
import { Favorites } from './features/favorites/Favorites';
import { loadFavorites, saveFavorites, toggleFavorite } from './store/favorites';

export default function App() {
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);

  const handleToggleFavorite = useCallback((symbol: string) => {
    setFavorites((prev) => {
      const next = toggleFavorite(symbol, prev);
      saveFavorites(next);
      return next;
    });
  }, []);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard favorites={favorites} onToggleFavorite={handleToggleFavorite} />} />
        <Route path="/instrument/:symbol" element={<Detail />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/yields" element={<Yields />} />
        <Route path="/favorites" element={<Favorites favorites={favorites} onToggleFavorite={handleToggleFavorite} />} />
      </Routes>
    </Layout>
  );
}