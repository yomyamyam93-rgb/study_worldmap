# 🌍 세계 여행 — 아이를 위한 나라·수도 배우기

다섯 살 아이가 지도에서 나라를 눌러 국기·수도·재미있는 이야기를 듣는 앱입니다.
아이패드 사파리에서 열고 **공유 → 홈 화면에 추가**를 하면 전체화면 앱처럼 씁니다.

## 무엇이 들어 있나

- **지도** — 실제 국경선(Natural Earth 50m), 두 손가락으로 확대·축소, 끌어서 이동
- **나라 194개** — 국기, 수도, 대륙, 아이가 좋아할 한 줄 이야기
- **대륙 6 · 바다 3 · 극지 2** — 눌러서 설명 듣기
- **음성 1,031개** — 미리 만들어 둔 파일이라 인터넷 없이 즉시 재생
- **놀이** — 음성으로 문제를 듣고 국기 3개 중 고르기, 별 모으기

## 폴더

| 위치 | 내용 |
|---|---|
| `index.html` | 앱 전체 |
| `assets/countries.js` | 나라 194개 (이름·수도·대륙·위치) |
| `assets/extra.js` | 나라별 이야기·인사말, 퀴즈 목록, 발음 교정표 |
| `assets/places.js` | 대륙·바다·극지 |
| `assets/world-paths.js` | 지도 모양 |
| `assets/flags/` | 국기 194개 |
| `assets/voice/` | 음성 파일 |
| `tools/` | 지도·나라목록·음성을 다시 만드는 스크립트 |

## 고치는 법

나라 이야기를 바꾸려면 `assets/extra.js`에서 그 줄을 고치고,
`assets/voice/`에서 해당 음성 파일을 지운 뒤 아래를 실행합니다.

```bash
node tools/3-목소리만들기.js
```

음성을 만들려면 `tools/키.txt`에 일레븐랩스 API 키가 필요합니다.
이 파일은 저장소에 올라가지 않습니다.

## 사용한 자료

- 지도 — [Natural Earth](https://www.naturalearthdata.com/) (퍼블릭 도메인), [world-atlas](https://github.com/topojson/world-atlas)
- 국기 — [flag-icons](https://github.com/lipis/flag-icons) (MIT)
- 나라 정보 — [world-countries](https://github.com/mledoze/countries) (ODbL)
- 음성 — ElevenLabs
