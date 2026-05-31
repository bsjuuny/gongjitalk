'use client';

import type { NoticeAnalysis } from '@/lib/types';
import EmptyState from './EmptyState';

interface Props {
  notices: NoticeAnalysis[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function SavedNoticeList({ notices, onSelect, onDelete }: Props) {
  if (notices.length === 0) {
    return <EmptyState icon="📂" title="저장된 공지가 없습니다" description="분석 후 저장하기 버튼을 눌러 보세요" />;
  }

  return (
    <div className="space-y-3 pb-8">
      {notices.map(n => {
        const done = n.checklistItems.filter(i => i.done).length;
        const total = n.checklistItems.length;

        return (
          <div key={n.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <button
              onClick={() => onSelect(n.id)}
              className="w-full text-left px-4 py-4 hover:bg-amber-50 transition-all active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-amber-600 font-semibold mb-1">
                    {new Date(n.createdAt).toLocaleDateString('ko-KR', {
                      month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                  <p className="text-sm font-semibold text-gray-700 leading-snug">{n.summary}</p>
                  <p className="text-xs text-gray-400 truncate mt-1">{n.originalText.slice(0, 60)}...</p>
                </div>
                {total > 0 && (
                  <div className="flex-shrink-0 text-right">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      done === total ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {done}/{total}
                    </span>
                  </div>
                )}
              </div>
              {total > 0 && (
                <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-amber-400 h-1.5 rounded-full transition-all"
                    style={{ width: `${(done / total) * 100}%` }}
                  />
                </div>
              )}
            </button>
            <div className="border-t border-gray-50 px-4 py-2 flex justify-end">
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
                className="text-xs text-gray-300 hover:text-red-400 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
