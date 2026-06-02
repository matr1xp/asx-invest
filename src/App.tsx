import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './features/dashboard/Dashboard';
import { Detail } from './features/detail/Detail';
import { Portfolio } from './features/portfolio/Portfolio';
import { Yields } from './features/yields/Yields';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/instrument/:symbol" element={<Detail />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/yields" element={<Yields />} />
      </Routes>
    </Layout>
  );
}
