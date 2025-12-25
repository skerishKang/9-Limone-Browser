// 서비스 워커: 향후 광고 큐 fetch 및 기본 이벤트 훅
chrome.runtime.onInstalled.addListener(() => {
  console.log('리모네 확장 설치/업데이트 완료');
});

chrome.runtime.onStartup.addListener(() => {
  console.log('리모네 확장 시작');
});

// 메시지 수신: 플레이어 탭 열기
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'REMONE_OPEN_PLAYER' && message.adId) {
    chrome.tabs.create({ url: chrome.runtime.getURL('player/player.html') });
    sendResponse({ ok: true });
  }
});

// TODO: 광고 큐 스케줄 fetch, 세션 토큰 검증, 중복 적립 방지 로직 연동 예정

