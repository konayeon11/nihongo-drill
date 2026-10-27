# 일본어 학습 (여행·취미 회화)

여행(길 찾기·주문·쇼핑)과 취미 생활(골프·뜨개질·온천·미술관)에서 바로 쓰는
일본어를 익히는 모바일 웹앱입니다. 간격 반복(SRS) 복습, 스트릭/XP, 음성 읽기,
오프라인 PWA를 지원합니다.

- 설계 문서: [`PLAN.md`](./PLAN.md)
- 데이터는 전부 로컬(IndexedDB)에 저장됩니다. 서버·로그인이 없습니다.

## 개발

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

`main` 브랜치에 푸시하면 GitHub Actions가 자동으로 빌드해 GitHub Pages에 배포합니다.
