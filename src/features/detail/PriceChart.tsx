import { useEffect, useRef } from 'react';
import { createChart, type IChartApi } from 'lightweight-charts';
import type { Candle } from '../../types';

export function PriceChart({ candles }: { candles: Candle[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart: IChartApi = createChart(ref.current, {
      height: 360,
      layout: { background: { color: 'transparent' }, textColor: '#9CA3AF' },
      grid: { vertLines: { color: '#1A3355' }, horzLines: { color: '#1A3355' } },
      timeScale: { timeVisible: true },
    });
    const series = chart.addAreaSeries({ lineColor: '#F5A623', topColor: 'rgba(245,166,35,.3)', bottomColor: 'rgba(245,166,35,0)' });
    series.setData(candles.map((c) => ({ time: c.t as never, value: c.c })));
    chart.timeScale().fitContent();
    const onResize = () => chart.applyOptions({ width: ref.current!.clientWidth });
    onResize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); chart.remove(); };
  }, [candles]);
  return <div ref={ref} style={{ width: '100%' }} />;
}
