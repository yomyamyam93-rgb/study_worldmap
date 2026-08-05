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
console.log('버전:', v);
