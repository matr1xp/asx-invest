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
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Yields')).toBeInTheDocument();
    expect(screen.getByText('child content')).toBeInTheDocument();
  });
});
