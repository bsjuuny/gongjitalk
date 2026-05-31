import type { NoticeAnalysis } from './types';

const STORAGE_KEY = 'gongjitalk_notices';
const STORAGE_EVENT = 'gongjitalk_notices_changed';
const EMPTY_NOTICES: NoticeAnalysis[] = [];
let cachedRaw: string | null | undefined;
let cachedNotices: NoticeAnalysis[] = EMPTY_NOTICES;

function normalizeNotice(notice: NoticeAnalysis): NoticeAnalysis {
  return {
    ...notice,
    noticeTypes: notice.noticeTypes ?? [],
    dateTime: notice.dateTime ?? [],
    deadlines: notice.deadlines ?? [],
    locations: notice.locations ?? [],
    supplies: notice.supplies ?? [],
    clothing: notice.clothing ?? [],
    fees: notice.fees ?? [],
    parentTasks: notice.parentTasks ?? [],
    cautions: notice.cautions ?? [],
    childMessage: notice.childMessage ?? '선생님이 보내신 공지를 확인해서 아이와 함께 이야기해 주세요.',
    teacherReply: notice.teacherReply ?? '별도 답장이 필요하지 않을 수 있습니다. 원문을 확인하세요.',
    needsConfirmation: notice.needsConfirmation ?? [],
    confidence: notice.confidence ?? 40,
    checklistItems: notice.checklistItems ?? [],
  };
}

export function getSavedNotices(): NoticeAnalysis[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedNotices;
    const parsed = raw ? JSON.parse(raw) : [];
    cachedRaw = raw;
    cachedNotices = Array.isArray(parsed) ? parsed.map(normalizeNotice) : EMPTY_NOTICES;
    return cachedNotices;
  } catch {
    return [];
  }
}

export function getSavedNoticesServerSnapshot(): NoticeAnalysis[] {
  return EMPTY_NOTICES;
}

export function subscribeSavedNotices(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleChange = () => {
    cachedRaw = undefined;
    onStoreChange();
  };

  window.addEventListener('storage', handleChange);
  window.addEventListener(STORAGE_EVENT, handleChange);
  return () => {
    window.removeEventListener('storage', handleChange);
    window.removeEventListener(STORAGE_EVENT, handleChange);
  };
}

function notifySavedNoticesChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function saveNotice(notice: NoticeAnalysis): void {
  if (typeof window === 'undefined') return;
  const existing = getSavedNotices();
  const filtered = existing.filter(n => n.id !== notice.id);
  const updated = [notice, ...filtered].slice(0, 20);
  const raw = JSON.stringify(updated);
  localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedNotices = updated;
  notifySavedNoticesChanged();
}

export function updateNotice(notice: NoticeAnalysis): void {
  saveNotice(notice);
}

export function deleteNotice(id: string): void {
  if (typeof window === 'undefined') return;
  const existing = getSavedNotices();
  const updated = existing.filter(n => n.id !== id);
  const raw = JSON.stringify(updated);
  localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedNotices = updated;
  notifySavedNoticesChanged();
}
