import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  padding: '.4rem .9rem', borderRadius: 30, fontWeight: 600, fontSize: '.9rem',
  color: isActive ? 'var(--navy)' : 'rgba(255,255,255,.7)',
  background: isActive ? 'var(--gold)' : 'transparent',
});

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <nav style={{ display: 'flex', gap: '.5rem', alignItems: 'center', height: 64,
        padding: '0 1.5rem', background: 'var(--navy-mid)', position: 'sticky', top: 0, zIndex: 10 }}>
        <span style={{ fontWeight: 800, marginRight: '1rem' }}>🇦🇺 ASX Tracker</span>
        <NavLink to="/" style={linkStyle} end>Dashboard</NavLink>
        <NavLink to="/portfolio" style={linkStyle}>Portfolio</NavLink>
        <NavLink to="/yields" style={linkStyle}>Yields</NavLink>
        <span style={{ marginLeft: 'auto', fontSize: '.72rem', color: 'var(--text-muted)' }}>
          Prices ~15-min delayed
        </span>
      </nav>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem' }}>{children}</main>
    </div>
  );
}
