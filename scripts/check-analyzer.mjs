import fs from 'fs';
import ts from 'typescript';
import vm from 'vm';

const source = fs.readFileSync('lib/analyzer.ts', 'utf8').replace(/^import type .*\r?\n/, '');
const js = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText;

const sandbox = { exports: {}, console };
vm.runInNewContext(js, sandbox);

const samples = [
  '다음 주 월요일(6월 3일) 오전 10시 30분부터 수영 수업이 있습니다. 준비물: 수영복, 수영모, 수건, 개인 세면도구를 챙겨 보내주세요. 도시락은 필요 없습니다. 참석 여부는 내일까지 문자로 알려주세요. 우천 시 일정이 변경될 수 있습니다.',
  '5월 31일 금요일 숲 체험을 갑니다. 장소: 서울숲. 활동하기 편한 복장과 운동화를 착용해 주세요. 개인 물통, 모자, 선크림을 준비해 주세요. 참가비 5,000원은 오늘까지 납부 바랍니다.',
  '사진 촬영 동의서를 6/2까지 제출해 주세요. 알레르기나 투약이 필요한 경우 담임에게 말씀해주세요. 장난감은 가져오지 않습니다.',
  `안녕하세요!😊
내일은 5월 친구의 생일축하와 함께 선우숲 산책 활동이 예정되어 있습니다!
원활한 활동 진행을 위해 오전 9시 50분까지 등원할 수 있도록 협조 부탁드립니다.

또한 산책 활동 중 벌레에 물릴 수 있어 가정에서 패치 착용 또는 벌레 기피제를 뿌리고 등원할 수 있도록 준비 부탁드립니다!!

예담반 친구들이 즐겁고 안전하게 활동할 수 있도록 많은 협조 부탁드립니다^^
감사합니다💛`,
];

for (const text of samples) {
  const result = sandbox.exports.analyzeNotice(text);
  console.log(JSON.stringify({
    summary: result.summary,
    noticeTypes: result.noticeTypes,
    dateTime: result.dateTime,
    deadlines: result.deadlines,
    locations: result.locations,
    supplies: result.supplies,
    clothing: result.clothing,
    fees: result.fees,
    parentTasks: result.parentTasks,
    cautions: result.cautions,
    teacherReply: result.teacherReply,
    checklist: result.checklistItems.map((item) => item.text),
    confidence: result.confidence,
  }, null, 2));
}
