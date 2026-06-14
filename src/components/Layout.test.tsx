import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Layout } from './Layout';

describe('Layout', () => {
  it('renders nav links and children', () => {
    render(
      <MemoryRouter>
        <Layout><div>child content</div></Layout>
      </MemoryRouter>,
    );
    // Each nav label appears in both the desktop top nav and the mobile bottom tab bar.
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Favorites').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Portfolio').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Yields').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('child content')).toBeInTheDocument();
  });
});