import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Detail } from './Detail';

vi.mock('./PriceChart', () => ({ PriceChart: () => <div>chart</div> }));
vi.mock('../../api/hooks', () => ({
  useHistory: () => ({ data: [], isLoading: false, isError: false }),
}));

describe('Detail', () => {
  it('renders the instrument name and guide stats for a known symbol', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={['/instrument/VHY']}>
          <Routes><Route path="/instrument/:symbol" element={<Detail />} /></Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByText(/Vanguard Aust\. High Yield/)).toBeInTheDocument();
    expect(screen.getByText(/MER/)).toBeInTheDocument();
  });
});
