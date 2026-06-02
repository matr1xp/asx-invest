import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChangeBadge } from './ChangeBadge';

describe('ChangeBadge', () => {
  it('shows a green up value for positive change', () => {
    render(<ChangeBadge changePct={2.5} />);
    const el = screen.getByText('+2.50%');
    expect(el).toBeInTheDocument();
    expect(el).toHaveStyle({ color: 'var(--green)' });
  });
  it('shows a red value for negative change', () => {
    render(<ChangeBadge changePct={-1.1} />);
    expect(screen.getByText('-1.10%')).toHaveStyle({ color: 'var(--red)' });
  });
  it('shows a dash when undefined', () => {
    render(<ChangeBadge changePct={undefined} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
