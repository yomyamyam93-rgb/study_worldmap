/* 대륙 · 바다 · 극지
   p = 지도 위 자리 (x = 경도+180, y = 90-위도)
   줄을 추가하면 바로 지도에 나타납니다. */
const PLACES = [
/* ── 대륙 ─────────────────────────────── */
{id:'asia',    ko:'아시아',     en:'Asia',          kind:'대륙', emo:'🐘', p:[272,42],
 fact:'세계에서 가장 큰 대륙이에요. 사람도 제일 많이 살아요'},
{id:'europe',  ko:'유럽',       en:'Europe',        kind:'대륙', emo:'🏰', p:[190,36],
 fact:'작지만 나라가 아주 많은 대륙이에요'},
{id:'africa',  ko:'아프리카',   en:'Africa',        kind:'대륙', emo:'🦁', p:[200,88],
 fact:'사자와 기린이 사는 더운 대륙이에요'},
{id:'namerica',ko:'북아메리카', en:'North America', kind:'대륙', emo:'🍁', p:[78,48],
 fact:'미국과 캐나다가 있는 대륙이에요'},
{id:'samerica',ko:'남아메리카', en:'South America', kind:'대륙', emo:'🦜', p:[122,108],
 fact:'아마존이라는 아주 큰 밀림이 있는 대륙이에요'},
{id:'oceania', ko:'오세아니아', en:'Oceania',       kind:'대륙', emo:'🦘', p:[317,118],
 fact:'호주와 작은 섬나라들이 모여 있는 곳이에요'},
/* ── 바다 ─────────────────────────────── */
{id:'pacific', ko:'태평양',     en:'Pacific Ocean', kind:'바다', emo:'🌊', p:[40,95],
 fact:'세계에서 가장 넓은 바다예요'},
{id:'atlantic',ko:'대서양',     en:'Atlantic Ocean',kind:'바다', emo:'⛵', p:[152,75],
 fact:'아메리카와 유럽 사이에 있는 바다예요'},
{id:'indian',  ko:'인도양',     en:'Indian Ocean',  kind:'바다', emo:'🐠', p:[258,112],
 fact:'따뜻하고 물고기가 많은 바다예요'},
/* ── 극지 ─────────────────────────────── */
{id:'arctic',  ko:'북극',       en:'Arctic',        kind:'극지', emo:'🐻‍❄️', p:[180,11],
 fact:'지구의 북쪽 끝이에요. 북극곰이 살아요'},
{id:'antarctic',ko:'남극',      en:'Antarctica',    kind:'극지', emo:'🐧', p:[180,160],
 fact:'지구의 남쪽 끝이에요. 펭귄이 살고 아주 추워요'}
];
