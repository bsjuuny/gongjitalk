'use client';

import type { NoticeAnalysis } from '@/lib/types';
import ChecklistCard from './ChecklistCard';

interface Props {
  analysis: NoticeAnalysis;
  onUpdate: (updated: NoticeAnalysis) => void;
  onBack: () => void;
  onSave: () => void;
  isSaved: boolean;
}

interface SectionProps {
  icon: string;
  title: string;
  color: string;
  children: React.ReactNode;
}

function Section({ icon, title, color, children }: SectionProps) {
  return (
    <div className={`bg-white rounded-2xl border ${color} p-4 space-y-2`}>
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <h3 className="font-bold text-gray-700 text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function TagList({ items, color }: { items: string[]; color: string }) {
  if (items.length === 0) return <p className="text-sm text-gray-400">없음</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span key={i} className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{item}</span>
      ))}
    </div>
  );
}

export default function AnalysisResult({ analysis, onUpdate, onBack, onSave, isSaved }: Props) {
  const updateChecklist = (items: NoticeAnalysis['checklistItems']) => {
    onUpdate({ ...analysis, checklistItems: items });
  };

  const doneCount = analysis.checklistItems.filter(i => i.done).length;
  const totalCount = analysis.checklistItems.length;

  return (
    <div className="space-y-4 pb-8">
      {/* 상단 바 */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          ← 돌아가기
        </button>
        <button
          onClick={onSave}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            isSaved
              ? 'bg-green-50 text-green-600 border border-green-200'
              : 'bg-amber-400 hover:bg-amber-500 text-white'
          }`}
        >
          {isSaved ? '✓ 저장됨' : '저장하기'}
        </button>
      </div>

      {/* 주의 문구 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-2">
        <span className="text-base flex-shrink-0">⚠️</span>
        <p className="text-xs text-amber-700 leading-relaxed">
          AI가 아닌 키워드 분석 결과입니다. <strong>공지 원문을 꼭 다시 확인하세요.</strong> 정확하지 않을 수 있습니다.
        </p>
      </div>

      {/* 핵심 요약 */}
      <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-4 text-white">
        <p className="text-xs font-semibold opacity-80 mb-1">핵심 요약</p>
        <p className="font-bold text-base leading-snug">{analysis.summary}</p>
        <p className="text-xs font-semibold opacity-80 mt-2">분석 신뢰도 {analysis.confidence}%</p>
      </div>

      {/* 체크리스트 진행도 */}
      {totalCount > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-700">✅ 체크리스트</span>
            <span className="text-sm font-bold text-amber-600">{doneCount}/{totalCount}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
            <div
              className="bg-amber-400 h-2 rounded-full transition-all duration-300"
              style={{ width: totalCount > 0 ? `${(doneCount / totalCount) * 100}%` : '0%' }}
            />
          </div>
          <ChecklistCard items={analysis.checklistItems} onChange={updateChecklist} />
        </div>
      )}

      {/* 공지 유형 */}
      {analysis.noticeTypes.length > 0 && (
        <Section icon="🏷️" title="공지 유형" color="border-gray-100">
          <TagList items={analysis.noticeTypes} color="bg-gray-100 text-gray-700" />
        </Section>
      )}

      {/* 날짜/시간 */}
      <Section icon="📅" title="날짜·시간" color="border-blue-100">
        <TagList items={analysis.dateTime} color="bg-blue-50 text-blue-700" />
      </Section>

      {/* 마감 */}
      {analysis.deadlines.length > 0 && (
        <Section icon="⏰" title="마감·기한" color="border-red-100">
          <TagList items={analysis.deadlines} color="bg-red-50 text-red-700" />
        </Section>
      )}

      {/* 장소 */}
      {analysis.locations.length > 0 && (
        <Section icon="📍" title="장소" color="border-sky-100">
          <TagList items={analysis.locations} color="bg-sky-50 text-sky-700" />
        </Section>
      )}

      {/* 준비물 */}
      {analysis.supplies.length > 0 && (
        <Section icon="🎒" title="준비물" color="border-orange-100">
          <div className="flex flex-wrap gap-1.5">
            {analysis.supplies.map((item, i) => (
              <span key={i} className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-xs font-semibold border border-orange-100">
                {item}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* 복장 */}
      {analysis.clothing.length > 0 && (
        <Section icon="👕" title="복장 안내" color="border-purple-100">
          <TagList items={analysis.clothing} color="bg-purple-50 text-purple-700" />
        </Section>
      )}

      {/* 비용 */}
      {analysis.fees.length > 0 && (
        <Section icon="💳" title="비용·납부" color="border-emerald-100">
          <TagList items={analysis.fees} color="bg-emerald-50 text-emerald-700" />
        </Section>
      )}

      {/* 부모가 할 일 */}
      {analysis.parentTasks.length > 0 && (
        <Section icon="📝" title="부모가 할 일" color="border-green-100">
          <ul className="space-y-1.5">
            {analysis.parentTasks.map((t, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-600">
                <span className="text-green-500 flex-shrink-0">·</span>
                <span className="leading-snug">{t}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 아이에게 말해줄 문장 */}
      <Section icon="🧒" title="아이에게 말해줄 문장" color="border-pink-100">
        <p className="text-sm text-gray-600 leading-relaxed bg-pink-50 rounded-xl px-3 py-2.5">
          {analysis.childMessage}
        </p>
      </Section>

      {/* 선생님께 답장 */}
      <Section icon="💬" title="선생님께 답장" color="border-teal-100">
        <p className="text-sm text-gray-600 leading-relaxed bg-teal-50 rounded-xl px-3 py-2.5">
          {analysis.teacherReply}
        </p>
      </Section>

      {/* 확인이 필요한 부분 */}
      {(analysis.needsConfirmation.length > 0 || analysis.cautions.length > 0) && (
        <Section icon="🔍" title="확인이 필요한 부분" color="border-yellow-100">
          <ul className="space-y-1.5">
            {[...analysis.needsConfirmation, ...analysis.cautions].map((t, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-600">
                <span className="text-yellow-500 flex-shrink-0">!</span>
                <span className="leading-snug">{t}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 원문 */}
      <details className="bg-gray-50 rounded-2xl border border-gray-100">
        <summary className="px-4 py-3 text-sm font-medium text-gray-500 cursor-pointer select-none">
          원문 보기
        </summary>
        <p className="px-4 pb-4 text-sm text-gray-500 whitespace-pre-wrap leading-relaxed">
          {analysis.originalText}
        </p>
      </details>
    </div>
  );
}
