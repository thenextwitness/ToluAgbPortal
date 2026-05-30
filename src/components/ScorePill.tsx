type Props = { category: string; score: number; max?: number };

export default function ScorePill({ category, score, max = 30 }: Props) {
  const pct = score / max;
  const colour = pct >= 0.8
    ? 'bg-black text-white'
    : pct >= 0.6
    ? 'bg-[#C9A84C] text-black'
    : 'bg-black/8 text-black border border-black/15';

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold ${colour}`}
      style={{ fontFamily: 'Cinzel, Georgia, serif' }}>
      {category}: {score}/{max}
    </span>
  );
}
