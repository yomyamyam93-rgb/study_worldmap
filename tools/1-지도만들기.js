// TopoJSON(Natural Earth 50m) → 360x180 등장방형 path
//  · 실제 해안선을 최대한 살린다 (단순화 아주 약하게)
//  · 날짜변경선(경도 180도)을 넘는 구간은 끊는다  (지구를 가로지르는 선 방지)
//  · canvas 로 그리기 때문에 점이 많아도 괜찮다
const fs = require('fs');
const A = 'C:/Users/user/study/world-map/assets/';
const topo = require(A + 'topojson-client.js');
const world = JSON.parse(fs.readFileSync(A + 'countries-50m.json', 'utf8'));

const TOL      = 0.012;    // 단순화 정도 (0에 가까울수록 원본 그대로)
const MIN_AREA = 0.0006;   // 이보다 작은 섬은 뺌 (제곱도, 약 7km²)
const DEC      = 100;      // 좌표 소수 2자리

const geo = topo.feature(world, world.objects.countries);
const P = n => Math.round(n * DEC) / DEC;
const X = lon => P(lon + 180);
const Y = lat => P(90 - lat);

/* ── 선 단순화 (Douglas–Peucker) ── */
function dp(pts, tol){
  if(pts.length < 3) return pts;
  let maxD = 0, idx = 0;
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1e-9;
  for(let i = 1; i < pts.length - 1; i++){
    const d = Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / len;
    if(d > maxD){ maxD = d; idx = i; }
  }
  if(maxD <= tol) return [pts[0], pts[pts.length - 1]];
  return dp(pts.slice(0, idx + 1), tol).slice(0, -1).concat(dp(pts.slice(idx), tol));
}

/* 닫힌 도형은 시작=끝이라 그냥 dp를 쓰면 뭉개진다.
   가장 먼 점에서 둘로 잘라 각각 단순화한 뒤 다시 잇는다. */
function simplifyRing(r, tol){
  const pts = r.slice(0, -1);
  if(pts.length < 6) return r;
  let far = 0, fd = -1;
  for(let i = 1; i < pts.length; i++){
    const d = Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]);
    if(d > fd){ fd = d; far = i; }
  }
  const a = dp(pts.slice(0, far + 1), tol);
  const b = dp(pts.slice(far).concat([pts[0]]), tol);
  return a.slice(0, -1).concat(b);
}

const area = r => {
  let a = 0;
  for(let i = 0; i < r.length - 1; i++) a += r[i][0]*r[i+1][1] - r[i+1][0]*r[i][1];
  return Math.abs(a / 2);
};

/* ── 링 하나 → path
   날짜변경선(경도 ±180)을 넘어가면 그 지점에서 지도 가장자리까지 선을 긋고 끊는다.
   그냥 끊기만 하면 도형이 대각선으로 이어져 이상한 띠가 생긴다. ── */
function ring(r){
  const s = simplifyRing(r, TOL);
  const pts = s.slice(0, -1);                       // 닫힌 링이라 마지막 = 첫 점
  const n = pts.length;
  if(n < 3) return '';

  // 넘어가는 지점의 가장자리 위도
  const cross = (a, b) => {
    const east = a[0] > 0;                          // 동쪽(+180)으로 넘어가는가
    const t = east ? (180 - a[0]) / (b[0] + 360 - a[0])
                   : (-180 - a[0]) / (b[0] - 360 - a[0]);
    return { y: Y(a[1] + (b[1] - a[1]) * t), out: east ? 360 : 0, in: east ? 0 : 360 };
  };

  let cut = -1;
  for(let i = 0; i < n; i++)
    if(Math.abs(pts[i][0] - pts[(i-1+n)%n][0]) > 180){ cut = i; break; }

  if(cut < 0) return 'M' + pts.map(p => X(p[0]) + ',' + Y(p[1])).join('L') + 'Z';

  // 넘어가는 지점 바로 뒤부터 시작하게 순서를 돌린다
  const q = pts.slice(cut).concat(pts.slice(0, cut));
  const first = cross(pts[(cut-1+n)%n], pts[cut]);
  let d = 'M' + first.in + ',' + first.y;           // 가장자리에서 시작
  for(let i = 0; i < n; i++){
    if(i > 0 && Math.abs(q[i][0] - q[i-1][0]) > 180){
      const c = cross(q[i-1], q[i]);
      d += 'L' + c.out + ',' + c.y + 'Z';           // 가장자리까지 긋고 닫기
      d += 'M' + c.in + ',' + c.y;                  // 반대쪽 가장자리에서 다시
    }
    d += 'L' + X(q[i][0]) + ',' + Y(q[i][1]);
  }
  return d + 'L' + first.out + ',' + first.y + 'Z';
}

function toPath(g){
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  const big = Math.max(...polys.map(p => area(p[0])));
  return polys
    .filter(p => area(p[0]) >= MIN_AREA || area(p[0]) === big)
    .map(p => p.map(ring).join(''))
    .join('');
}

/* ── 국기를 놓을 자리 = 가장 큰 폴리곤 ── */
function biggest(g){
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  let best = null, bestA = -1;
  for(const poly of polys){
    const a = area(poly[0]);
    if(a > bestA){ bestA = a; best = poly[0]; }
  }
  return best;
}
function centroid(r){
  let a = 0, cx = 0, cy = 0;
  for(let i = 0; i < r.length - 1; i++){
    const cr = r[i][0]*r[i+1][1] - r[i+1][0]*r[i][1];
    a += cr; cx += (r[i][0]+r[i+1][0])*cr; cy += (r[i][1]+r[i+1][1])*cr;
  }
  a /= 2;
  return [Math.round(X(cx/(6*a))*10)/10, Math.round(Y(cy/(6*a))*10)/10];
}
function bbox(r){
  const xs = r.map(p => X(p[0])), ys = r.map(p => Y(p[1]));
  return [P(Math.min(...xs)), P(Math.min(...ys)), P(Math.max(...xs)), P(Math.max(...ys))];
}

const out = [];
for(const f of geo.features){
  if(!f.geometry) continue;
  const d = toPath(f.geometry);
  if(!d) continue;
  const r = biggest(f.geometry);
  // fb = 섬까지 포함한 전체 범위 (화면 밖 나라를 건너뛰는 데 씀)
  const all = (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates)
    .flatMap(p => p[0]);
  out.push({ id: String(f.id), n: f.properties.name,
    c: centroid(r), b: bbox(r), fb: bbox(all), d });
}

fs.writeFileSync(A + 'world-paths.js', 'const WORLD = ' + JSON.stringify(out) + ';\n', 'utf8');

const pts = out.reduce((s, f) => s + (f.d.match(/[ML]/g) || []).length, 0);
console.log('나라:', out.length, '| 점:', pts,
  '| 크기 KB:', Math.round(fs.statSync(A + 'world-paths.js').size / 1024));
