import { Cycle } from '../types';

export function CycleSummary({ cycle }: { cycle: Cycle }) {
  const parts: string[] = [];

  if (cycle.retrieval) {
    parts.push(`채취 ${cycle.retrieval.totalEggs}개`);
  }

  if (cycle.culture) {
    parts.push(`${cycle.culture.day}일 ${cycle.culture.totalEmbryos}개`);
  }

  if (cycle.pgt) {
    parts.push(`PGT ${cycle.pgt.euploid}개`);
  }

  if (parts.length === 0) {
    return <div className="text-sm text-gray-400">기록 없음</div>;
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {parts.map((part, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="font-medium text-gray-700">{part}</span>
          {idx < parts.length - 1 && <span className="text-gray-300">→</span>}
        </div>
      ))}
    </div>
  );
}