import { LineChart, Line, YAxis } from 'recharts';

export function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  if (!data || data.length < 2) return <div style={{ height: 36 }} />;
  const points = data.map((v, i) => ({ i, v }));
  return (
    <LineChart width={120} height={36} data={points}>
      <YAxis hide domain={['dataMin', 'dataMax']} />
      <Line type="monotone" dataKey="v" dot={false} strokeWidth={2}
        stroke={up ? 'var(--green)' : 'var(--red)'} isAnimationActive={false} />
    </LineChart>
  );
}
