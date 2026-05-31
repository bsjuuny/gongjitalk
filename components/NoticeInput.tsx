'use client';

import { useRef, useState } from 'react';
import ExampleNoticeButton from './ExampleNoticeButton';

interface Props {
  onAnalyze: (text: string) => void;
  recentNotices: { id: string; createdAt: string; summary: string; originalText: string }[];
  onSelectRecent: (id: string) => void;
  error?: string;
}

export default function NoticeInput({ onAnalyze, recentNotices, onSelectRecent, error }: Props) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const currentText = textareaRef.current?.value ?? text;
    if (currentText.trim().length < 5) {
      setText(currentText);
      return;
    }
    setText(currentText);
    onAnalyze(currentText);
  };

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="text-center pt-6 pb-2">
        <div className="text-3xl mb-2">📬</div>
        <h1 className="text-2xl font-bold text-gray-800">공지톡 정리함</h1>
        <p className="text-sm text-gray-500 mt-1">어린이집·유치원 공지문을 붙여넣으면<br />부모가 할 일을 바로 정리해 드려요</p>
        <p className="text-xs text-gray-400 mt-2">아이 이름 등 개인정보 입력 없이 사용할 수 있어요</p>
      </div>

      {/* 입력 영역 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="공지문, 알림장, 문자 내용을 여기에 붙여넣으세요..."
          className="w-full h-44 resize-none text-sm text-gray-700 placeholder-gray-300 focus:outline-none leading-relaxed"
        />
        <div className="border-t border-gray-100 pt-3 space-y-3">
          <ExampleNoticeButton onSelect={setText} />
          <button
            onClick={handleSubmit}
            className={`w-full py-3.5 font-bold text-base rounded-xl active:scale-[0.98] transition-all shadow-sm ${
              text.trim().length < 5
                ? 'bg-gray-100 text-gray-300 hover:bg-gray-100'
                : 'bg-amber-400 hover:bg-amber-500 text-white'
            }`}
          >
            분석하기 ✨
          </button>
          {text.trim().length > 0 && text.trim().length < 5 && (
            <p className="text-xs text-red-400 text-center">공지문을 조금 더 입력해 주세요</p>
          )}
          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}
        </div>
      </div>

      {/* 최근 분석 목록 */}
      {recentNotices.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">최근 분석한 공지</p>
          {recentNotices.slice(0, 3).map(n => (
            <button
              key={n.id}
              onClick={() => onSelectRecent(n.id)}
              className="w-full text-left bg-white rounded-xl border border-gray-100 px-4 py-3 hover:border-amber-200 hover:bg-amber-50 transition-all active:scale-[0.99]"
            >
              <p className="text-xs text-amber-700 font-medium mb-0.5">
                {new Date(n.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-sm text-gray-700 truncate">{n.summary}</p>
              <p className="text-xs text-gray-400 truncate mt-0.5">{n.originalText.slice(0, 50)}...</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
