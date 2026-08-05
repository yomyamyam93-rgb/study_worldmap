// 홈 화면 아이콘 만들기 — 지도를 그대로 그린 정사각형 PNG
//   실행:  node tools/4-아이콘만들기.js
//   결과:  assets/icon-180.png (아이패드 홈 화면),  assets/icon-512.png
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const A = path.join(__dirname, '..', 'assets');

const WORLD = new Function(
  fs.readFileSync(path.join(A, 'world-paths.js'), 'utf8') + '; return WORLD;')();

/* 아이콘에 담을 구역 (유럽·아프리카·아시아·오세아니아가 보이는 정사각형) */
const X0 = 152, Y0 = 6, SPAN = 176;
const SEA  = [0x8f, 0xd0, 0xee];
const LAND = [0xbf, 0xe3, 0x9f];

/* path 문자열 → 폴리곤 목록 */
const polys = [];
for(const w of WORLD){
  for(const sub of w.d.split('M').slice(1)){
    const pts = ('M' + sub).match(/[ML]([-\d.]+),([-\d.]+)/g)
      .map(m => m.slice(1).split(',').map(Number));
    if(pts.length > 2) polys.push(pts);
  }
}
// 가로 선분 목록 (y 범위와 x 계산에 필요한 값만)
const edges = [];
for(const p of polys){
  for(let i = 0; i < p.length; i++){
    const a = p[i], b = p[(i + 1) % p.length];
    if(a[1] === b[1]) continue;
    edges.push(a[1] < b[1] ? [a[1], b[1], a[0], (b[0]-a[0])/(b[1]-a[1])]
                           : [b[1], a[1], b[0], (a[0]-b[0])/(a[1]-b[1])]);
  }
}
edges.sort((e, f) => e[0] - f[0]);

function draw(size){
  const px = SPAN / size;
  const raw = Buffer.alloc(size * (size * 3 + 1));
  let head = 0;
  for(let row = 0; row < size; row++){
    const off = row * (size * 3 + 1);
    raw[off] = 0;                                   // 필터 없음
    for(let i = 0; i < size; i++){
      raw[off + 1 + i*3] = SEA[0];
      raw[off + 2 + i*3] = SEA[1];
      raw[off + 3 + i*3] = SEA[2];
    }
    const wy = Y0 + (row + 0.5) * px;
    // 이 줄을 지나는 선분들의 x 좌표
    const xs = [];
    for(const e of edges){
      if(e[0] > wy) break;
      if(e[1] > wy) xs.push(e[2] + (wy - e[0]) * e[3]);
    }
    xs.sort((a, b) => a - b);
    for(let k = 0; k + 1 < xs.length; k += 2){      // 짝수-홀수 규칙
      let s = Math.round((xs[k]   - X0) / px);
      let e = Math.round((xs[k+1] - X0) / px);
      if(e < 0 || s > size) continue;
      s = Math.max(0, s); e = Math.min(size, e);
      for(let i = s; i < e; i++){
        raw[off + 1 + i*3] = LAND[0];
        raw[off + 2 + i*3] = LAND[1];
        raw[off + 3 + i*3] = LAND[2];
      }
    }
    if(row % Math.ceil(size/4) === 0) head++;
  }
  return raw;
}

/* ── PNG 만들기 ── */
const TBL = (() => { const t = new Int32Array(256);
  for(let n = 0; n < 256; n++){ let c = n;
    for(let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c; } return t; })();
function crc32(buf){ let c = -1;
  for(let i = 0; i < buf.length; i++) c = TBL[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ -1) >>> 0; }
function chunk(type, data){
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function png(size, raw){
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

for(const size of [180, 512]){
  const file = path.join(A, 'icon-' + size + '.png');
  fs.writeFileSync(file, png(size, draw(size)));
  console.log('만듦:', path.basename(file), Math.round(fs.statSync(file).size/1024) + 'KB');
}
