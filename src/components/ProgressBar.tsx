type Props = { current: number; total: number; label?: string };

export default function ProgressBar({ current, total, label }: Props) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      {label && <div className="text-xs text-black mb-1">{label}</div>}
      <div className="h-1.5 bg-black/10 overflow-hidden">
        <div className="h-full bg-[#C9A84C] transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs text-black/50 mt-1">{current} of {total}</div>
    </div>
  );
}
