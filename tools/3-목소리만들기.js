// 일레븐랩스로 음성 파일을 미리 만들어 assets/voice/ 에 저장합니다.
//
// 쓰는 법
//  1) world-map/tools/키.txt 파일을 만들고 아래 두 줄을 넣으세요 (값은 본인 것으로)
//       ELEVENLABS_API_KEY=여기에_키
//       VOICE_ID=여기에_목소리ID
//     ※ 목소리 ID는 일레븐랩스 사이트 Voices 에서 목소리를 고르면 나옵니다.
//  2) world-map 폴더에서 실행:  node tools/3-목소리만들기.js
//
// 이미 만든 파일은 건너뛰므로, 중간에 멈춰도 다시 실행하면 이어서 만듭니다.
// --미리보기 를 붙이면 글자 수와 비용만 계산하고 실제로는 만들지 않습니다.

const fs = require('fs');
const path = require('path');
const ROOT  = path.join(__dirname, '..');
const VDIR  = path.join(ROOT, 'assets', 'voice');
const DRY   = process.argv.includes('--미리보기');

/* ── 설정 읽기 ── */
function readKeys(){
  const f = path.join(__dirname, '키.txt');
  if(!fs.existsSync(f)){
    console.error('tools/키.txt 파일이 없습니다. 아래 두 줄을 넣어 만들어 주세요:\n' +
      '  ELEVENLABS_API_KEY=...\n  VOICE_ID=...');
    process.exit(1);
  }
  const cfg = {};
  for(const line of fs.readFileSync(f, 'utf8').split(/\r?\n/)){
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/);
    if(m) cfg[m[1]] = m[2];
  }
  if(!cfg.ELEVENLABS_API_KEY || !cfg.VOICE_ID){
    console.error('키.txt 에 ELEVENLABS_API_KEY 와 VOICE_ID 가 모두 있어야 합니다.');
    process.exit(1);
  }
  if(cfg.ELEVENLABS_API_KEY.includes('여기에')){
    console.error('tools/키.txt 를 열어 ELEVENLABS_API_KEY= 뒤에 본인 키를 붙여넣고 저장해 주세요.');
    process.exit(1);
  }
  return cfg;
}

/* ── 앱 데이터 불러오기 ── */
const load = (file, name) => {
  const src = fs.readFileSync(path.join(ROOT, 'assets', file), 'utf8');
  return new Function(src + '; return ' + name + ';')();
};
const COUNTRIES = load('countries.js', 'COUNTRIES');
const EXTRA     = load('extra.js', 'EXTRA');
const QUIZ_CC   = load('extra.js', 'QUIZ_CC');
const PRON      = load('extra.js', 'PRON');
const PLACES    = load('places.js', 'PLACES');

/* ── 만들 음성 목록 ── */
const jobs = [];
// 마침표가 없으면 끝음이 올라가서 묻는 말처럼 들립니다. 없으면 붙여 줍니다.
const add = (key, text) => {
  if(!text || !text.trim()) return;
  let t = text.trim();
  for(const [from, to] of Object.entries(PRON))      // 발음 교정
    t = t.split(from).join(to);
  if(!/[.!?…]$/.test(t)) t += '.';
  jobs.push({ key, text: t });
};

/* 한국어 조사 (앱의 index.html 과 똑같이 맞춰야 파일 이름이 들어맞습니다) */
const hasJong = w => { const c = w.charCodeAt(w.length-1);
  return c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 !== 0; };
const eunNeun = w => w + (hasJong(w) ? '은' : '는');
const ieyo    = w => w + (hasJong(w) ? '이에요' : '예요');

for(const c of COUNTRIES){
  const x = EXTRA[c.cc];
  add('name_' + c.cc, c.ko);                                        // 팝업이 뜬 뒤 부르는 이름
  add('cap_'  + c.cc, `${c.ko}의 수도는 ${ieyo(c.cap)}`);
  add('cont_' + c.cc, `${eunNeun(c.ko)} ${c.cont}에 있어요`);
  if(x){
    if(x.hi) add('hi_' + c.cc, x.hi);                               // 그 나라 인사말
    add('fact_' + c.cc, `${eunNeun(c.ko)} ${x.fact}`);
  }
  if(QUIZ_CC.indexOf(c.cc) >= 0){                                   // 놀이에 나오는 나라만
    add('q_flag_' + c.cc, `${c.ko}의 국기는 어느 것일까요?`);
    add('q_cap_'  + c.cc, `수도가 ${c.cap}인 나라는 어디일까요?`);
    add('q_fact_' + c.cc, `${x.fact}. 어느 나라일까요?`);
    add('ok_' + c.cc,     `${c.ko}, 정답이에요!`);
  }
}
for(const p of PLACES){                                             // 대륙 · 바다 · 극지
  add('pname_' + p.id, p.ko);
  add('pkind_' + p.id, `${eunNeun(p.ko)} ${ieyo(p.kind)}`);
  add('pfact_' + p.id, `${eunNeun(p.ko)} ${p.fact}`);
}
add('praise', '참 잘했어요! 별을 하나 받았어요');

/* ── 비용 미리보기 ── */
const chars = jobs.reduce((s, j) => s + j.text.length, 0);
console.log(`만들 음성: ${jobs.length}개 | 총 글자 수: ${chars.toLocaleString()}자`);
if(DRY){
  console.log('(미리보기 모드 — 실제로 만들지 않았습니다)');
  process.exit(0);
}

/* ── 실제 생성 ── */
const cfg = readKeys();
fs.mkdirSync(VDIR, { recursive: true });

(async () => {
  let made = 0, skipped = 0, failed = 0;
  for(let i = 0; i < jobs.length; i++){
    const j = jobs[i];
    const out = path.join(VDIR, j.key + '.mp3');
    if(fs.existsSync(out) && fs.statSync(out).size > 0){ skipped++; continue; }

    try{
      const res = await fetch(
        'https://api.elevenlabs.io/v1/text-to-speech/' + cfg.VOICE_ID + '?output_format=mp3_44100_64',
        { method:'POST',
          headers:{ 'xi-api-key': cfg.ELEVENLABS_API_KEY, 'Content-Type':'application/json' },
          body: JSON.stringify({ text: j.text, model_id: 'eleven_multilingual_v2',
            // 짧은 이름은 차분하게(억양이 튀지 않게), 문장은 밝고 표현이 살아 있게
            voice_settings: j.text.length <= 10
              ? { stability: 0.65, similarity_boost: 0.85, style: 0.15, use_speaker_boost: true }
              : { stability: 0.35, similarity_boost: 0.8,  style: 0.45, use_speaker_boost: true }
          }) });

      if(!res.ok){
        const msg = await res.text();
        console.error(`  실패 ${j.key}: ${res.status} ${msg.slice(0,160)}`);
        failed++;
        if(res.status === 401){ console.error('  → 키가 잘못됐습니다. 중단합니다.'); break; }
        if(res.status === 429){ console.error('  → 이번 달 사용량을 다 썼습니다. 중단합니다.'); break; }
        continue;
      }
      fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
      made++;
    }catch(e){ console.error('  오류 ' + j.key + ': ' + e.message); failed++; }

    if((i+1) % 20 === 0 || i === jobs.length-1)
      console.log(`  ${i+1}/${jobs.length}  (새로 만듦 ${made} / 건너뜀 ${skipped} / 실패 ${failed})`);
  }

  const have = fs.readdirSync(VDIR).filter(f => f.endsWith('.mp3'));
  console.log(`\n끝났습니다. 음성 ${have.length}개 준비됨 (새로 ${made}, 건너뜀 ${skipped}, 실패 ${failed})`);
  if(failed) console.log('실패한 것은 다시 실행하면 이어서 만듭니다.');
})();
