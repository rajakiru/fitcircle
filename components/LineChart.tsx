import { WeightPoint } from '@/lib/data';

type Props = {
  data: WeightPoint[];
  field: keyof WeightPoint;
  min: number;
  max: number;
  color: string;
};

export default function LineChart({ data, field, min, max, color }: Props) {
  const W = 320, H = 80, pad = 4;
  const xs = data.map((_, i) => pad + (i / (data.length - 1)) * (W - pad * 2));
  const ys = data.map(d => H - pad - ((Number(d[field]) - min) / (max - min)) * (H - pad * 2));
  const pathD = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x} ${ys[i]}`).join(' ');
  const areaD = `${pathD} L ${xs[xs.length - 1]} ${H} L ${xs[0]} ${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <path d={areaD} fill={color} fillOpacity="0.1" />
      <path d={pathD} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="4" fill={color} />
    </svg>
  );
}
