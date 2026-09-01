// 배포 전에 실행하면 version.json 이 새 번호로 바뀝니다.
// 앱은 켤 때마다 이 번호를 확인해서, 달라졌으면 저장분을 비우고 새로 받습니다.
//   실행:  node tools/5-버전올리기.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'version.json');
const d = new Date();
const p = n => String(n).padStart(2, '0');
const v = `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
fs.writeFileSync(file, JSON.stringify({ v }) + '\n', 'utf8');
// 화면(index.html)에도 같은 번호를 적어 둡니다. 그래야 앱이 '지금 열린 화면이
// 옛날 것'임을 스스로 알아채고 새로 받아옵니다.
const idx = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(idx, 'utf8');
const next = html.replace(/const BUILT = '[^']*'/, "const BUILT = '" + v + "'");
if(next === html) console.log('주의: index.html 에서 BUILT 줄을 못 찾았습니다.');
else fs.writeFileSync(idx, next, 'utf8');

console.log('버전:', v);
