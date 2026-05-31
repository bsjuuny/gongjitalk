'use client';

import { EXAMPLE_NOTICES } from '@/lib/analyzer';

interface Props {
  onSelect: (text: string) => void;
}

export default function ExampleNoticeButton({ onSelect }: Props) {
  const labels = ['🌲 숲 체험', '👨‍👩‍👧 참관 수업', '🏊 수영 수업'];

  return (
    <div>
      <p className="text-xs text-amber-700 font-medium mb-2">예시 공지문 불러오기</p>
      <div className="flex flex-wrap gap-2">
        {labels.map((label, i) => (
          <button
            key={i}
            onClick={() => onSelect(EXAMPLE_NOTICES[i])}
            className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium rounded-full hover:bg-amber-100 active:scale-95 transition-all"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
