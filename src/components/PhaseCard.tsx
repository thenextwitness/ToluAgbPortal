'use client';

type Props = {
  phase: number;
  name: string;
  status: 'complete' | 'current' | 'locked';
};

export default function PhaseCard({ phase, name, status }: Props) {
  return (
    <div className={`border p-4 flex flex-col gap-2 transition-all ${
      status === 'current' ? 'border-[#C9A84C] bg-white shadow-sm'
      : status === 'complete' ? 'border-black bg-black'
      : 'border-black/15 bg-[#F2EAD9] opacity-70'
    }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
        status === 'current' ? 'bg-[#C9A84C] text-black'
        : status === 'complete' ? 'bg-white text-black'
        : 'bg-black/20 text-black'
      }`}>
        {status === 'complete' ? '✓' : phase}
      </div>
      <div className="text-xs uppercase tracking-wide text-black" style={{ fontFamily: 'Cinzel, Georgia, serif' }}>
        Phase {phase}
      </div>
      <div className={`font-semibold text-sm ${status === 'complete' ? 'text-white' : 'text-black'}`}>{name}</div>
      <div className={`text-xs font-medium ${
        status === 'complete' ? 'text-white/70' : status === 'current' ? 'text-[#9E7F2E]' : 'text-black/50'
      }`}>
        {status === 'complete' ? '✓ Complete' : status === 'current' ? '→ In Progress' : 'Locked'}
      </div>
    </div>
  );
}
