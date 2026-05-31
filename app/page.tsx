'use client';

import { useState, useCallback, useMemo, useSyncExternalStore } from 'react';
import type { NoticeAnalysis } from '@/lib/types';
import { analyzeNotice } from '@/lib/analyzer';
import {
  deleteNotice,
  getSavedNotices,
  getSavedNoticesServerSnapshot,
  saveNotice,
  subscribeSavedNotices,
  updateNotice,
} from '@/lib/storage';
import NoticeInput from '@/components/NoticeInput';
import AnalysisResult from '@/components/AnalysisResult';
import SavedNoticeList from '@/components/SavedNoticeList';

type Tab = 'input' | 'saved';
type View = 'list' | 'result';

export default function HomePage() {
  const [tab, setTab] = useState<Tab>('input');
  const [view, setView] = useState<View>('list');
  const notices = useSyncExternalStore(
    subscribeSavedNotices,
    getSavedNotices,
    getSavedNoticesServerSnapshot,
  );
  const [current, setCurrent] = useState<NoticeAnalysis | null>(null);
  const [analyzeError, setAnalyzeError] = useState('');
  const savedIds = useMemo(() => new Set(notices.map(n => n.id)), [notices]);

  const handleAnalyze = (text: string) => {
    try {
      setAnalyzeError('');
      const result = analyzeNotice(text);
      setCurrent(result);
      setView('result');
    } catch (error) {
      console.error('[gongjitalk] analyze failed', error);
      setAnalyzeError('분석 중 오류가 발생했습니다. 공지문을 조금 줄이거나 다시 시도해 주세요.');
    }
  };

  const handleSelectRecent = (id: string) => {
    const found = notices.find(n => n.id === id);
    if (found) { setCurrent(found); setView('result'); }
  };

  const handleUpdate = useCallback((updated: NoticeAnalysis) => {
    setCurrent(updated);
    if (savedIds.has(updated.id)) {
      updateNotice(updated);
    }
  }, [savedIds]);

  const handleSave = () => {
    if (!current) return;
    saveNotice(current);
  };

  const handleDelete = (id: string) => {
    deleteNotice(id);
    if (current?.id === id) { setCurrent(null); setView('list'); }
  };

  const handleBack = () => {
    setView('list');
    setCurrent(null);
  };

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <div className="max-w-lg mx-auto px-4">
        {view === 'result' && current ? (
          <AnalysisResult
            analysis={current}
            onUpdate={handleUpdate}
            onBack={handleBack}
            onSave={handleSave}
            isSaved={savedIds.has(current.id)}
          />
        ) : (
          <>
            <div className="flex gap-1 pt-5 pb-2 sticky top-0 bg-[#fafaf8] z-10">
              <button
                onClick={() => setTab('input')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  tab === 'input'
                    ? 'bg-amber-400 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                📝 공지 입력
              </button>
              <button
                onClick={() => setTab('saved')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  tab === 'saved'
                    ? 'bg-amber-400 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                📂 저장함 {notices.length > 0 && `(${notices.length})`}
              </button>
            </div>

            {tab === 'input' ? (
              <NoticeInput
                onAnalyze={handleAnalyze}
                recentNotices={notices}
                onSelectRecent={handleSelectRecent}
                error={analyzeError}
              />
            ) : (
              <SavedNoticeList
                notices={notices}
                onSelect={(id) => {
                  const found = notices.find(n => n.id === id);
                  if (found) { setCurrent(found); setView('result'); }
                }}
                onDelete={handleDelete}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
