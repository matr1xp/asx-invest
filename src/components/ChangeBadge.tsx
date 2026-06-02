import { fmtSignedPct } from '../lib/format';

export function ChangeBadge({ changePct }: { changePct: number | undefined }) {
  const color = changePct == null ? 'var(--text-muted)' : changePct >= 0 ? 'var(--green)' : 'var(--red)';
  return <span style={{ color, fontFamily: 'var(--mono)', fontWeight: 700 }}>{fmtSignedPct(changePct)}</span>;
}
