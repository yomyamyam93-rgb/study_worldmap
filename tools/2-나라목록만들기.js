// 전 세계 정식 국가 목록 만들기
//  · 지도에 모양이 있는 나라는 그 무게중심에 국기를 놓는다
//  · 싱가포르·몰타처럼 지도에 그리기엔 너무 작은 나라는 실제 위도·경도에 국기만 놓는다
const fs = require('fs');
const A = 'C:/Users/user/study/world-map/assets/';
const wc = JSON.parse(fs.readFileSync(A + 'world-countries.json', 'utf8'));
const WORLD = JSON.parse(fs.readFileSync(A + 'world-paths.js', 'utf8')
  .replace(/^const WORLD = /, '').replace(/;\s*$/, ''));

// 한국어 수도 이름
const CAP = {
fj:'수바',tz:'도도마',ca:'오타와',us:'워싱턴',kz:'아스타나',uz:'타슈켄트',pg:'포트모르즈비',
id:'자카르타',ar:'부에노스아이레스',cl:'산티아고',cd:'킨샤사',so:'모가디슈',ke:'나이로비',
sd:'하르툼',td:'은자메나',ht:'포르토프랭스',do:'산토도밍고',ru:'모스크바',bs:'나소',no:'오슬로',
tl:'딜리',za:'프리토리아',ls:'마세루',mx:'멕시코시티',uy:'몬테비데오',br:'브라질리아',bo:'수크레',
pe:'리마',co:'보고타',pa:'파나마시티',cr:'산호세',ni:'마나과',hn:'테구시갈파',sv:'산살바도르',
gt:'과테말라시티',bz:'벨모판',ve:'카라카스',gy:'조지타운',sr:'파라마리보',fr:'파리',ec:'키토',
jm:'킹스턴',cu:'아바나',zw:'하라레',bw:'가보로네',na:'빈트후크',sn:'다카르',ml:'바마코',
mr:'누악쇼트',bj:'포르토노보',ne:'니아메',ng:'아부자',cm:'야운데',tg:'로메',gh:'아크라',
ci:'야무수크로',gn:'코나크리',gw:'비사우',lr:'몬로비아',sl:'프리타운',bf:'와가두구',cf:'방기',
cg:'브라자빌',ga:'리브르빌',gq:'말라보',zm:'루사카',mw:'릴롱궤',mz:'마푸투',sz:'로밤바',
ao:'루안다',bi:'기테가',il:'예루살렘',lb:'베이루트',mg:'안타나나리보',ps:'라말라',gm:'반줄',
tn:'튀니스',dz:'알제',jo:'암만',ae:'아부다비',qa:'도하',kw:'쿠웨이트시티',iq:'바그다드',
om:'무스카트',vu:'포트빌라',kh:'프놈펜',th:'방콕',la:'비엔티안',mm:'네피도',vn:'하노이',
kp:'평양',kr:'서울',mn:'울란바토르',in:'뉴델리',bd:'다카',bt:'팀부',np:'카트만두',
pk:'이슬라마바드',af:'카불',tj:'두샨베',kg:'비슈케크',tm:'아시가바트',ir:'테헤란',sy:'다마스쿠스',
am:'예레반',se:'스톡홀름',by:'민스크',ua:'키이우',pl:'바르샤바',at:'빈',hu:'부다페스트',
md:'키시너우',ro:'부쿠레슈티',lt:'빌뉴스',lv:'리가',ee:'탈린',de:'베를린',bg:'소피아',
gr:'아테네',tr:'앙카라',al:'티라나',hr:'자그레브',ch:'베른',lu:'룩셈부르크',be:'브뤼셀',
nl:'암스테르담',pt:'리스본',es:'마드리드',ie:'더블린',sb:'호니아라',nz:'웰링턴',au:'캔버라',
lk:'콜롬보',cn:'베이징',tw:'타이베이',it:'로마',dk:'코펜하겐',gb:'런던',is:'레이캬비크',
az:'바쿠',ge:'트빌리시',ph:'마닐라',my:'쿠알라룸푸르',bn:'반다르스리브가완',si:'류블랴나',
fi:'헬싱키',sk:'브라티슬라바',cz:'프라하',er:'아스마라',jp:'도쿄',py:'아순시온',ye:'사나',
sa:'리야드',cy:'니코시아',ma:'라바트',eg:'카이로',ly:'트리폴리',et:'아디스아바바',dj:'지부티',
ug:'캄팔라',rw:'키갈리',ba:'사라예보',mk:'스코페',rs:'베오그라드',me:'포드고리차',
tt:'포트오브스페인',ss:'주바',
// 지도에 모양이 없는 아주 작은 나라들
ad:'안도라라베야',ag:'세인트존스',bh:'마나마',bb:'브리지타운',km:'모로니',cv:'프라이아',
dm:'로조',fm:'팔리키르',gd:'세인트조지스',ki:'타라와',kn:'바스테르',lc:'캐스트리스',
li:'파두츠',mc:'모나코',mv:'말레',mh:'마주로',mt:'발레타',mu:'포트루이스',nr:'야렌',
pw:'응게룰무드',sg:'싱가포르',sm:'산마리노',st:'상투메',sc:'빅토리아',to:'누쿠알로파',
tv:'푸나푸티',va:'바티칸시티',vc:'킹스타운',ws:'아피아'
};

// 아이가 알아듣기 쉬운 이름 / 데이터셋 오류 바로잡기
const NAME = { kr:'대한민국', kp:'북한', mn:'몽골', tr:'튀르키예', za:'남아프리카공화국',
  cd:'콩고민주공화국', cf:'중앙아프리카공화국', do:'도미니카공화국', dm:'도미니카연방',
  gq:'적도기니', ba:'보스니아헤르체고비나', tt:'트리니다드토바고', sb:'솔로몬제도',
  ci:'코트디부아르', ag:'앤티가바부다', kn:'세인트키츠네비스', vc:'세인트빈센트그레나딘',
  st:'상투메프린시페', va:'바티칸', fm:'미크로네시아', mh:'마셜제도' };

const CONT = { Asia:'아시아', Europe:'유럽', Africa:'아프리카', Oceania:'오세아니아' };
const SUB  = { 'North America':'북아메리카','South America':'남아메리카',
  'Central America':'중앙아메리카','Caribbean':'카리브해' };

const P = n => Math.round(n * 10) / 10;
// 같은 나라 번호를 쓰는 조각이 여럿이면(예: 호주 ↔ 애시모어 제도) 가장 큰 것을 씁니다
const geo = new Map();
for(const w of WORLD){
  const old = geo.get(w.id);
  if(!old || w.ar > old.ar) geo.set(w.id, w);
}
const rows = [];
const noCap = [];

for(const c of wc){
  if(!c.independent || !c.capital || !c.capital.length) continue;
  const cc = c.cca2.toLowerCase();
  if(!CAP[cc]){ noCap.push(cc + ' ' + c.name.common); continue; }
  const g = geo.get(c.ccn3);
  rows.push({
    id: c.ccn3, cc,
    ko: NAME[cc] || c.translations.kor.common,
    en: c.name.common,
    cap: CAP[cc],
    cont: SUB[c.subregion] || CONT[c.region] || c.region,
    p: g ? g.c : [P(c.latlng[1] + 180), P(90 - c.latlng[0])],   // 국기를 놓을 자리
    b: g ? g.b : null,                                           // 지도 모양이 있으면 확대 범위
    a: g ? g.ar : 0                                              // 넓이 (천 km²)
  });
}
rows.sort((a, b) => a.ko.localeCompare(b.ko, 'ko'));

fs.writeFileSync(A + 'countries.js',
  '/* 전 세계 정식 국가 ' + rows.length + '개 — 지도·국기·수도 (자동 생성)\n' +
  '   b 가 null 인 나라는 지도에 그리기엔 너무 작아 국기 핀으로만 표시됩니다. */\n' +
  'const COUNTRIES = [\n' + rows.map(r => JSON.stringify(r)).join(',\n') + '\n];\n', 'utf8');

console.log('나라 수:', rows.length,
  '| 지도 모양 있음:', rows.filter(r => r.b).length,
  '| 핀만:', rows.filter(r => !r.b).length);
if(noCap.length) console.log('한국어 수도 이름이 없어 빠짐:', noCap.join(', '));
console.log('국기 코드:', rows.map(r => r.cc).join(' '));
