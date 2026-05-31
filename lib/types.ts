export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  category: 'supplies' | 'clothing' | 'task' | 'reply' | 'payment' | 'other';
}

export interface NoticeAnalysis {
  id: string;
  createdAt: string;
  originalText: string;
  summary: string;
  noticeTypes: string[];
  dateTime: string[];
  deadlines: string[];
  locations: string[];
  supplies: string[];
  clothing: string[];
  fees: string[];
  parentTasks: string[];
  cautions: string[];
  childMessage: string;
  teacherReply: string;
  needsConfirmation: string[];
  confidence: number;
  checklistItems: ChecklistItem[];
}

export interface SavedNotice {
  id: string;
  createdAt: string;
  originalText: string;
  summary: string;
  checklistItems: ChecklistItem[];
}
