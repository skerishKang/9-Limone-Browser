# 리모네 브라우저 리워드 확장 (초기 뼈대)

- Manifest V3 기반.
- 사이드바 iframe 주입, 플레이어 포커스 기반 타이머, 1분 활동 로그 데모 포함.

## 주요 파일
- `manifest.json`: 확장 설정.
- `background.js`: 설치/시작 로그.
- `content/`: 사이드바/트래커 자바스크립트와 스타일, 사이드바 HTML.
- `player/`: 전체화면 플레이어 데모.
- `popup/`: 기본 팝업 템플릿.

## 다음 작업 아이디어
- 광고 큐 API 연동 및 리워드 검증 토큰 처리.
- 중복 적립 방지: adId + 세션 토큰 검증 후 지급.
- 가시성/포커스 체크 고도화: IntersectionObserver + Page Visibility.
- 활동/시청 이벤트 로깅 규격 정의 후 서버 송신.
- 광고 카드는 iframe 내부에서 렌더링되며, 클릭 시 postMessage로 부모에 알리고 background가 player를 연다.
