'use client';

import { useState } from 'react';
import type { ChecklistItem } from '@/lib/types';

interface Props {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

const categoryLabel: Record<ChecklistItem['category'], string> = {
  supplies: '🎒 준비물',
  clothing: '👕 복장',
  task: '✅ 할 일',
  reply: '💬 답장',
  payment: '💳 납부',
  other: '📌 기타',
};

export default function ChecklistCard({ items, onChange }: Props) {
  const [newText, setNewText] = useState('');

  const toggle = (id: string) => {
    onChange(items.map(it => it.id === id ? { ...it, done: !it.done } : it));
  };

  const remove = (id: string) => {
    onChange(items.filter(it => it.id !== id));
  };

  const add = () => {
    if (!newText.trim()) return;
    const newItem: ChecklistItem = {
      id: `cl-${Date.now()}`,
      text: newText.trim(),
      done: false,
      category: 'other',
    };
    onChange([...items, newItem]);
    setNewText('');
  };

  const done = items.filter(i => i.done);
  const pending = items.filter(i => !i.done);

  return (
    <div className="space-y-3">
      {/* 미완료 */}
      {pending.length > 0 && (
        <div className="space-y-2">
          {pending.map(item => (
            <div key={item.id} className="flex items-start gap-3 bg-white rounded-xl border border-gray-100 px-3 py-3 group">
              <button
                onClick={() => toggle(item.id)}
                className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-amber-300 hover:border-amber-500 hover:bg-amber-50 transition-all mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-amber-600 font-semibold">{categoryLabel[item.category]}</span>
                <p className="text-sm text-gray-700 leading-snug">{item.text}</p>
              </div>
              <button
                onClick={() => remove(item.id)}
                className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 완료 */}
      {done.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 font-medium px-1">완료 ({done.length})</p>
          {done.map(item => (
            <div key={item.id} className="flex items-start gap-3 bg-gray-50 rounded-xl border border-gray-100 px-3 py-3 group opacity-60">
              <button
                onClick={() => toggle(item.id)}
                className="flex-shrink-0 w-6 h-6 rounded-full bg-green-400 border-2 border-green-400 flex items-center justify-center transition-all mt-0.5"
              >
                <span className="text-white text-xs font-bold">✓</span>
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-400 line-through leading-snug">{item.text}</p>
              </div>
              <button
                onClick={() => remove(item.id)}
                className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">체크리스트가 비어있습니다</p>
      )}

      {/* 항목 추가 */}
      <div className="flex gap-2 pt-1">
        <input
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="항목 직접 추가..."
          className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-300 placeholder-gray-300"
        />
        <button
          onClick={add}
          disabled={!newText.trim()}
          className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 disabled:bg-gray-100 disabled:text-gray-300 text-white font-bold rounded-xl transition-all text-sm"
        >
          추가
        </button>
      </div>
    </div>
  );
}
