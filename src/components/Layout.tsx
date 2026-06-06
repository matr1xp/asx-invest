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
      <nav className="nav-top">
        <span style={{ fontWeight: 800, marginRight: '1rem' }}>🇦🇺 ASX Tracker</span>
        <div className="nav-top-links">
          <NavLink to="/" style={linkStyle} end>Dashboard</NavLink>
          <NavLink to="/portfolio" style={linkStyle}>Portfolio</NavLink>
          <NavLink to="/yields" style={linkStyle}>Yields</NavLink>
        </div>
        <span className="nav-disclaimer">Prices ~15-min delayed</span>
      </nav>

      {/* Bottom tab bar — visible on mobile only (CSS toggles display) */}
      <nav className="nav-bottom" aria-label="Main navigation">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
          Dashboard
        </NavLink>
        <NavLink to="/portfolio" className={({ isActive }) => isActive ? 'active' : ''}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          </svg>
          Portfolio
        </NavLink>
        <NavLink to="/yields" className={({ isActive }) => isActive ? 'active' : ''}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          Yields
        </NavLink>
      </nav>

      <main className="main-content">{children}</main>
    </div>
  );
}
