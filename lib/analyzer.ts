import type { NoticeAnalysis, ChecklistItem } from './types';

const DATE_PATTERN = /(\d{4}[./-]\d{1,2}[./-]\d{1,2}|\d{1,2}\s*월\s*\d{1,2}\s*일(?:\s*\([^)]+\))?|\d{1,2}[./]\d{1,2}(?:\s*\([^)]+\))?|(?:이번|다음)\s*주\s*[월화수목금토일]\s*요일|오늘|내일|모레|[월화수목금토일]\s*요일|(?:오전|오후)?\s*\d{1,2}\s*시(?:\s*\d{1,2}\s*분)?(?:\s*(?:까지|부터|전까지|예정|시작|출발|도착|등원|하원))?)/g;
const DEADLINE_PATTERN = /((?:(?:오늘|내일|모레|(?:이번|다음)\s*주\s*[월화수목금토일]\s*요일|\d{1,2}\s*월\s*\d{1,2}\s*일|\d{1,2}[./]\d{1,2}|[월화수목금토일]\s*요일).{0,18}|(?:오전|오후)?\s*\d{1,2}\s*시(?:\s*\d{1,2}\s*분)?\s*)(?:까지|전까지|마감))/g;
const FEE_PATTERN = /((?:참가비|비용|납부\s*금액)\s*[:：]?\s*\d{1,3}(?:,\d{3})*\s*원|\d{1,3}(?:,\d{3})*\s*원|\d+\s*만원|(?:참가비|비용|납부\s*금액)\s*[:：]?\s*[^.。!?]{2,30})/g;
const LOCATION_PATTERN = /((?:장소|집합\s*장소|출발\s*장소|도착\s*장소|모이는\s*곳)\s*[:：]?\s*[^,.。!?]{2,35}|(?:어린이집|유치원|강당|교실|놀이터|체육관|수영장|도서관|박물관|공원|공영주차장|현관|정문|운동장)[^,.。!?]{0,18})/g;

const DATE_CONTEXT_KEYWORDS = ['오늘', '내일', '모레', '이번 주', '다음 주', '요일', '오전', '오후', '등원', '하원'];

const SUPPLY_KEYWORDS = ['준비물', '준비', '챙겨', '보내주세요', '보내주시', '가져오세요', '가져와', '지참', '물통', '가방', '도시락', '간식', '수건', '여벌', '여벌옷', '갈아입을', '우산', '장화', '장갑', '모자', '썬크림', '선크림', '핫팩', '물티슈', '마스크', '손수건', '개인', '세면도구', '수영모', '수영복', '돗자리', '앞치마', '실내화', '패치', '기피제', '벌레 기피제'];
const SUPPLY_NOUNS = ['물통', '가방', '도시락', '간식', '수건', '여벌옷', '여벌', '우산', '장화', '장갑', '모자', '썬크림', '선크림', '핫팩', '물티슈', '마스크', '손수건', '세면도구', '수영모', '수영복', '돗자리', '앞치마', '실내화', '칫솔', '치약', '양치컵', '물놀이용품', '네임펜', '비닐봉투', '개인컵', '벌레 기피제', '기피제', '패치'];
const SUPPLY_STOPWORDS = ['준비물', '준비', '개인', '별도', '각자', '원문', '공지', '아이', '가정', '어린이집', '유치원', '오늘', '내일', '모레', '이번', '다음'];

const CLOTHING_KEYWORDS = ['복장', '입고', '신발', '운동화', '편한', '활동하기', '긴소매', '반소매', '긴팔', '반팔', '내복', '두꺼운', '얇은', '편안한', '체육복', '수영복', '수영모', '장화', '외투'];
const CLOTHING_NOUNS = ['운동화', '편한 복장', '활동하기 편한 복장', '긴소매', '반소매', '긴팔', '반팔', '내복', '체육복', '수영복', '수영모', '장화', '모자', '외투', '얇은 겉옷', '따뜻한 옷'];

const PARENT_TASK_KEYWORDS = ['서명', '동의서', '신청서', '제출', '확인', '사인', '답장', '회신', '연락', '문자', '사진', '업로드', '납부', '결제', '신청', '등록', '작성', '알려주세요', '말씀해주세요', '투약의뢰서'];
const REPLY_KEYWORDS = ['답장', '회신', '알려주세요', '연락주세요', '문의', '말씀해주세요', '문자로', '댓글'];
const CONFIRM_KEYWORDS = ['우천 시', '우천시', '변경', '취소', '미정', '추후', '재공지', '상황에 따라', '경우에 따라', '별도 안내', '대체'];
const CAUTION_KEYWORDS = ['주의', '유의', '금지', '불가', '안전', '알레르기', '투약', '아픈', '감기', '발열', '분실', '이름을 써', '귀중품', '장난감', '위험'];
const NEGATIVE_PATTERNS = [/필요\s*(?:없|없습|하지\s*않)/, /안\s*(?:보내|챙겨|가져)/, /보내지\s*마/, /준비하지\s*않/, /제외/, /급식으로\s*진행/];

const NOTICE_TYPE_RULES = [
  { label: '체험·견학', keywords: ['체험', '견학', '소풍', '현장학습', '나들이', '관람', '숲', '산책'] },
  { label: '수업·활동', keywords: ['수업', '활동', '수영', '체육', '요리', '미술', '특강', '산책'] },
  { label: '행사', keywords: ['행사', '발표회', '공연', '운동회', '생일', '졸업', '입학', '참관'] },
  { label: '서류·동의', keywords: ['동의서', '신청서', '서명', '사인', '제출', '작성'] },
  { label: '납부·결제', keywords: ['납부', '결제', '입금', '참가비', '비용'] },
  { label: '건강·안전', keywords: ['알레르기', '투약', '발열', '감기', '안전', '주의'] },
  { label: '등하원·일정', keywords: ['등원', '하원', '출발', '도착', '시간', '일정'] },
];

const EXAMPLES = [
  `내일 숲 체험이 있습니다. 활동하기 편한 복장과 운동화를 착용해 주세요. 개인 물통을 보내주시고, 우천 시 실내 활동으로 대체됩니다. 도시락은 필요 없으며 급식으로 진행됩니다.`,
  `이번 주 금요일(5월 30일)에 학부모 참관 수업이 있습니다. 오전 10시 30분에 시작하오니 참석 가능하신 분은 내일까지 선생님께 문자로 알려주세요. 주차는 어린이집 앞 공영주차장을 이용해 주시기 바랍니다.`,
  `다음 주 월요일부터 수영 수업이 시작됩니다. 수영복, 수영모, 수건, 개인 세면도구를 챙겨 보내주세요. 수영 가방은 별도로 준비해 주세요. 물에 대한 두려움이 있는 아이는 미리 말씀해 주시면 선생님이 도움을 드리겠습니다.`,
];

function normalizeText(text: string): string {
  return text
    .replace(/\r/g, '\n')
    .replace(/[·•]/g, ', ')
    .replace(/[，、]/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitSentences(text: string): string[] {
  return text
    .replace(/([.。!?！？])\s+/g, '$1\n')
    .split(/[;\n]+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function uniqueClean(items: string[], limit: number): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const cleaned = item
      .replace(/^[\s,:：\-()[\]]+|[\s,:：\-()[\]]+$/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    if (cleaned.length < 2 || seen.has(cleaned)) continue;
    seen.add(cleaned);
    result.push(cleaned);
    if (result.length >= limit) break;
  }
  return result;
}

function hasAny(text: string, keywords: string[]): boolean {
  return keywords.some(k => text.includes(k));
}

function hasNegativeMeaning(sentence: string): boolean {
  return NEGATIVE_PATTERNS.some(pattern => pattern.test(sentence));
}

function stripParticles(item: string): string {
  return item
    .replace(/^(?:오늘|내일|모레|이번\s*주|다음\s*주|[월화수목금토일]\s*요일)\s*/g, '')
    .replace(/\s*(?:챙겨|보내|가져|준비|지참).*$/g, '')
    .replace(/\s*(?:은|는|이|가|을|를|도|만|와|과|랑|하고|까지|부터|으로|로)$/g, '')
    .replace(/^(?:개인|각자|별도)\s+/g, '')
    .trim();
}

function splitListItems(chunk: string): string[] {
  return chunk
    .split(/[,/]|(?:\s+및\s+)|(?:\s+그리고\s+)|(?:\s+와\s+)|(?:\s+과\s+)/)
    .map(stripParticles)
    .filter(Boolean);
}

function extractByPattern(text: string, pattern: RegExp, limit: number): string[] {
  return uniqueClean(Array.from(text.matchAll(pattern), m => m[1] ?? m[0]), limit);
}

function removeContainedItems(items: string[]): string[] {
  const cleaned = uniqueClean(items, 20);
  return cleaned.filter((item, index) => {
    const compact = item.replace(/\s/g, '');
    return !cleaned.some((other, otherIndex) => {
      if (index === otherIndex) return false;
      const otherCompact = other.replace(/\s/g, '');
      return otherCompact.length < compact.length && compact.includes(otherCompact);
    });
  });
}

function preferSpecificItems(items: string[]): string[] {
  const cleaned = uniqueClean(items, 20);
  return cleaned.filter((item, index) => {
    const compact = item.replace(/\s/g, '');
    return !cleaned.some((other, otherIndex) => {
      if (index === otherIndex) return false;
      const otherCompact = other.replace(/\s/g, '');
      return otherCompact.length > compact.length && otherCompact.includes(compact);
    });
  });
}

function extractNoticeTypes(text: string): string[] {
  return NOTICE_TYPE_RULES
    .filter(rule => hasAny(text, rule.keywords))
    .map(rule => rule.label)
    .slice(0, 4);
}

function extractDates(text: string): string[] {
  const found = extractByPattern(text, DATE_PATTERN, 10);
  const context = DATE_CONTEXT_KEYWORDS.flatMap(kw => {
    if (!text.includes(kw) || found.some(f => f.includes(kw))) return [];
    const idx = text.indexOf(kw);
    return [text.slice(Math.max(0, idx - 5), Math.min(text.length, idx + 22)).trim()];
  });
  return uniqueClean([...found, ...context], 8).filter(item => !item.includes('협조 부탁'));
}

function extractSupplies(text: string): string[] {
  const found: string[] = [];
  for (const sent of splitSentences(text)) {
    if (!hasAny(sent, SUPPLY_KEYWORDS) || hasNegativeMeaning(sent)) continue;

    const labeled = sent.match(/(?:준비물|준비\s*사항)\s*[:：]\s*([^.!?。]+)/);
    if (labeled?.[1]) found.push(...splitListItems(labeled[1]));

    if (sent.includes('벌레') && (sent.includes('패치') || sent.includes('기피제'))) {
      if (sent.includes('패치')) found.push('벌레 물림 패치');
      if (sent.includes('기피제')) found.push('벌레 기피제');
    }

    const beforeAction = sent.match(/(.+?)\s*(?:을|를)?\s*(?:챙겨|보내|가져|준비|지참)/);
    if (beforeAction?.[1]) {
      const tail = beforeAction[1].replace(/^.*?(?:\s|^)(?:준비물|사항)\s*[:：]?/g, '');
      if (tail.length <= 30 && !tail.includes('수 있도록')) {
        found.push(...splitListItems(tail));
      }
    }

    for (const noun of SUPPLY_NOUNS) {
      if (sent.includes(noun)) found.push(noun);
    }

    const objectMatches = sent.match(/([가-힣A-Za-z0-9\s]{2,18})\s*(?:을|를)\s*(?:챙겨|보내|가져|준비|지참)/g);
    objectMatches?.forEach(match => {
      found.push(stripParticles(match.replace(/\s*(?:을|를)\s*(?:챙겨|보내|가져|준비|지참).*$/, '')));
    });
  }

  const filtered = found.filter(item => {
    const compact = item.replace(/\s/g, '');
    return compact.length >= 2 && !SUPPLY_STOPWORDS.some(stop => compact === stop.replace(/\s/g, ''));
  });

  if (filtered.length === 0 && hasAny(text, SUPPLY_KEYWORDS)) {
    const supplySent = splitSentences(text).find(sent => hasAny(sent, SUPPLY_KEYWORDS) && !hasNegativeMeaning(sent));
    if (supplySent) return [`준비물 문장 확인: ${supplySent.slice(0, 40)}${supplySent.length > 40 ? '…' : ''}`];
  }
  return preferSpecificItems(filtered).slice(0, 10);
}

function extractClothing(text: string): string[] {
  const found: string[] = [];
  for (const sent of splitSentences(text)) {
    if (!hasAny(sent, CLOTHING_KEYWORDS) || hasNegativeMeaning(sent)) continue;
    for (const noun of CLOTHING_NOUNS) {
      if (sent.includes(noun)) found.push(noun);
    }
    sent.match(/([가-힣\s]{2,20}(?:복장|차림|옷|신발|운동화))/g)?.forEach(item => found.push(item.trim()));
    sent.match(/([가-힣\s]{2,16})\s*(?:을|를)?\s*(?:착용|입고|신고)/g)?.forEach(match => {
      found.push(stripParticles(match.replace(/\s*(?:착용|입고|신고).*$/, '')));
    });
  }
  return removeContainedItems(found).slice(0, 6);
}

function extractParentTasks(text: string): string[] {
  const tasks: string[] = [];
  for (const sent of splitSentences(text)) {
    if (sent.includes('감사합니다') || sent.includes('즐겁고 안전하게')) continue;
    if (sent.includes('등원') && DEADLINE_PATTERN.test(sent)) {
      DEADLINE_PATTERN.lastIndex = 0;
      const deadline = sent.match(DEADLINE_PATTERN)?.[0];
      tasks.push(deadline ? `마감 ${deadline.trim()} - 등원하기` : sent);
      continue;
    }
    DEADLINE_PATTERN.lastIndex = 0;
    if (sent.includes('벌레') && (sent.includes('패치') || sent.includes('기피제'))) {
      tasks.push('벌레 물림 패치 또는 벌레 기피제 준비');
      continue;
    }
    const hasDeadline = DEADLINE_PATTERN.test(sent);
    DEADLINE_PATTERN.lastIndex = 0;
    const isPreparationRequest = hasAny(sent, ['준비 부탁', '등원할 수 있도록']);
    if (!hasAny(sent, PARENT_TASK_KEYWORDS) && !hasDeadline && !isPreparationRequest) continue;
    const deadline = sent.match(DEADLINE_PATTERN);
    const prefix = deadline?.[0] ? `마감 ${deadline[0].trim()} - ` : '';
    tasks.push(`${prefix}${sent}`);
  }
  return uniqueClean(tasks, 6);
}

function extractCautions(text: string): string[] {
  return uniqueClean(
    splitSentences(text).filter(sent => hasAny(sent, CAUTION_KEYWORDS) && !sent.includes('즐겁고 안전하게')),
    5,
  );
}

function makeChildMessage(text: string, noticeTypes: string[]): string {
  const events: string[] = [];
  if (noticeTypes.includes('체험·견학')) events.push('소풍이나 특별 활동');
  if (text.includes('수영')) events.push('수영 수업');
  if (text.includes('참관')) events.push('부모님이 어린이집에 방문');
  if (text.includes('발표') || text.includes('공연')) events.push('발표회');
  if (text.includes('사진')) events.push('사진 찍는 날');
  if (text.includes('생일')) events.push('생일 행사');
  if (events.length === 0) return '선생님이 보내신 공지를 확인해서 아이와 함께 이야기해 주세요.';
  return `"${uniqueClean(events, 3).join(', ')}이 있으니 즐겁게 준비해보자!"라고 말해주세요.`;
}

function makeTeacherReply(text: string): string {
  const replies: string[] = [];
  if (hasAny(text, REPLY_KEYWORDS)) {
    if (text.includes('참석') || text.includes('참관')) replies.push('참석 여부 회신');
    if (text.includes('신청')) replies.push('신청 여부 전달');
    if (text.includes('알레르기') || text.includes('주의사항') || text.includes('특이사항')) replies.push('아이 특이사항 전달');
    if (text.includes('사진') || text.includes('동의')) replies.push('동의 여부 전달');
    if (replies.length === 0) replies.push('공지 요청사항 회신');
  }
  if (replies.length === 0) return '별도 답장이 필요하지 않을 수 있습니다. 원문을 확인하세요.';
  return `선생님께 ${uniqueClean(replies, 4).join(', ')}이 필요합니다.`;
}

function extractConfirmNeeded(text: string): string[] {
  return uniqueClean(splitSentences(text).filter(sent => hasAny(sent, CONFIRM_KEYWORDS)), 4);
}

function confidenceScore(analysis: Omit<NoticeAnalysis, 'id' | 'createdAt' | 'originalText' | 'summary' | 'checklistItems' | 'confidence'>): number {
  let score = 35;
  if (analysis.noticeTypes.length > 0) score += 10;
  if (analysis.dateTime.length > 0) score += 12;
  if (analysis.supplies.length > 0) score += 12;
  if (analysis.parentTasks.length > 0) score += 12;
  if (analysis.deadlines.length > 0) score += 8;
  if (analysis.locations.length > 0) score += 6;
  if (analysis.fees.length > 0) score += 5;
  return Math.min(92, score);
}

function buildChecklist(analysis: Omit<NoticeAnalysis, 'id' | 'createdAt' | 'originalText' | 'summary' | 'checklistItems' | 'confidence'>): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  let idx = 0;
  const makeId = () => `cl-${Date.now()}-${idx++}`;
  const supplySet = new Set(analysis.supplies.map(s => s.replace(/\s/g, '')));

  analysis.supplies.forEach(s => {
    if (!s.includes('확인')) items.push({ id: makeId(), text: `준비물 챙기기: ${s}`, done: false, category: 'supplies' });
  });
  analysis.clothing.forEach(c => {
    if (!supplySet.has(c.replace(/\s/g, ''))) items.push({ id: makeId(), text: `복장 준비: ${c}`, done: false, category: 'clothing' });
  });
  analysis.fees.forEach(f => {
    items.push({ id: makeId(), text: `비용/납부 확인: ${f}`, done: false, category: 'payment' });
  });
  analysis.parentTasks.slice(0, 3).forEach(t => {
    const short = t.length > 38 ? t.slice(0, 38) + '…' : t;
    items.push({ id: makeId(), text: short, done: false, category: 'task' });
  });
  if (analysis.teacherReply && !analysis.teacherReply.includes('필요하지 않을')) {
    items.push({ id: makeId(), text: '선생님께 답장 보내기', done: false, category: 'reply' });
  }
  if (analysis.needsConfirmation.length > 0 || analysis.cautions.length > 0) {
    items.push({ id: makeId(), text: '원문 재확인 (주의/변경 가능성 있음)', done: false, category: 'other' });
  }
  return uniqueChecklist(items);
}

function uniqueChecklist(items: ChecklistItem[]): ChecklistItem[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const key = `${item.category}:${item.text.replace(/\s/g, '')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function analyzeNotice(text: string): NoticeAnalysis {
  const trimmed = normalizeText(text);
  const noticeTypes = extractNoticeTypes(trimmed);
  const dateTime = extractDates(trimmed);
  const deadlines = extractByPattern(trimmed, DEADLINE_PATTERN, 5);
  const locations = extractByPattern(trimmed, LOCATION_PATTERN, 5);
  const supplies = extractSupplies(trimmed);
  const clothing = extractClothing(trimmed);
  const fees = extractByPattern(trimmed, FEE_PATTERN, 5);
  const parentTasks = extractParentTasks(trimmed);
  const cautions = extractCautions(trimmed);
  const teacherReply = makeTeacherReply(trimmed);
  const needsConfirmation = extractConfirmNeeded(trimmed);

  const analysisCore = {
    noticeTypes,
    dateTime,
    deadlines,
    locations,
    supplies,
    clothing,
    fees,
    parentTasks,
    cautions,
    childMessage: makeChildMessage(trimmed, noticeTypes),
    teacherReply,
    needsConfirmation,
  };

  const summaryParts: string[] = [];
  if (noticeTypes.length > 0) summaryParts.push(noticeTypes[0]);
  if (dateTime.length > 0) summaryParts.push(`일정: ${dateTime[0]}`);
  if (deadlines.length > 0) summaryParts.push(`마감: ${deadlines[0]}`);
  if (supplies.length > 0) summaryParts.push(`준비물 ${supplies.length}가지`);
  if (fees.length > 0) summaryParts.push('비용 확인');
  if (parentTasks.length > 0) summaryParts.push(`부모 할 일 ${parentTasks.length}가지`);
  if (needsConfirmation.length > 0) summaryParts.push('변경 가능성 확인 필요');
  const summary = summaryParts.length > 0 ? summaryParts.join(' · ') : '공지 원문을 직접 확인해 주세요.';

  return {
    id: `notice-${Date.now()}`,
    createdAt: new Date().toISOString(),
    originalText: trimmed,
    summary,
    ...analysisCore,
    confidence: confidenceScore(analysisCore),
    checklistItems: buildChecklist(analysisCore),
  };
}

export const EXAMPLE_NOTICES = EXAMPLES;
