export function fmtCurrency(v: number | undefined): string {
  if (v == null || Number.isNaN(v)) return '—';
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(v);
}
export function fmtPct(v: number | undefined): string {
  if (v == null || Number.isNaN(v)) return '—';
  return `${v.toFixed(2)}%`;
}
export function fmtSignedPct(v: number | undefined): string {
  if (v == null || Number.isNaN(v)) return '—';
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
}
