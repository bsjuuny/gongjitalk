# 공지톡 정리함

어린이집·유치원 공지문을 붙여넣으면 부모가 해야 할 일을 자동으로 정리해 주는 웹 서비스입니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 배포

정적 파일 생성:

```bash
npm run build:static
```

FTP 업로드:

```powershell
$env:FTP_HOST="example.com"
$env:FTP_USER="ftp-user"
$env:FTP_PASSWORD="ftp-password"
$env:FTP_REMOTE_DIR="/public_html"
npm run deploy:ftp
```

FTP 비밀번호는 코드에 저장하지 말고 환경변수로만 설정하세요.

## 주요 기능

- **공지문 분석**: 공지 유형, 날짜·시간, 마감, 장소, 준비물, 복장, 비용, 부모 할 일을 키워드 기반으로 자동 추출
- **문맥 보정**: 준비물 부정문 제외, 목록형 준비물 분리, 납부/답장/주의사항 문장 감지
- **체크리스트**: 분석 결과에서 자동 생성, 체크/추가/삭제 가능
- **저장함**: 분석 결과를 localStorage에 저장 (최대 20개)
- **예시 공지문**: 숲 체험 / 학부모 참관 / 수영 수업 3가지 예시 제공
- **모바일 우선 UI**: 아침에 빠르게 확인할 수 있는 단순한 레이아웃

## 파일 구조

```
app/
  page.tsx              # 메인 페이지 (상태 관리)
  layout.tsx            # 루트 레이아웃
components/
  NoticeInput.tsx       # 공지문 입력 화면
  AnalysisResult.tsx    # 분석 결과 화면
  ChecklistCard.tsx     # 체크리스트 컴포넌트
  SavedNoticeList.tsx   # 저장함 목록
  ExampleNoticeButton.tsx  # 예시 공지 버튼
  EmptyState.tsx        # 빈 상태 표시
lib/
  types.ts              # 타입 정의 (NoticeAnalysis 등)
  analyzer.ts           # 분석 로직 (AI 연동 시 이 파일 교체)
  storage.ts            # localStorage 유틸
scripts/
  check-analyzer.mjs    # 샘플 공지 분석 검증 스크립트
  deploy-ftp.ps1        # out 폴더 FTP 업로드 스크립트
```

## AI API 연동 방법

`lib/analyzer.ts`의 `analyzeNotice` 함수를 교체하면 됩니다.

```ts
// 현재: 키워드 기반 규칙
export function analyzeNotice(text: string): NoticeAnalysis { ... }

// AI 연동 시: 서버 API 호출로 교체
export async function analyzeNotice(text: string): Promise<NoticeAnalysis> {
  const res = await fetch('/api/analyze', { method: 'POST', body: text });
  return res.json();
}
```

## 주의사항

- 키워드 기반 분석으로 결과가 부정확할 수 있습니다. 원문을 꼭 확인하세요.
- 아이 이름 등 개인정보는 입력하지 않아도 됩니다.
- 모든 데이터는 브라우저 localStorage에만 저장됩니다. 서버로 전송되지 않습니다.
