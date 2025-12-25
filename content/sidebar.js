// 사이드바 iframe 주입 및 메시지 처리
(function injectSidebar() {
  if (window.__remoneInjected) return;
  window.__remoneInjected = true;

  // iframe 생성
  const iframe = document.createElement('iframe');
  iframe.id = 'remone-sidebar-frame';
  iframe.src = chrome.runtime.getURL('content/sidebar.html');
  document.documentElement.appendChild(iframe);

  // 카드 클릭 -> 플레이어 페이지 오픈
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'REMONE_OPEN_PLAYER' && event.data?.adId) {
      chrome.runtime.sendMessage({ type: 'REMONE_OPEN_PLAYER', adId: event.data.adId });
    }
  });

  // 1초마다 포인트/큐 상태 동기화
  const syncTimer = setInterval(async () => {
    try {
      const state = await chrome.storage.local.get(['currentPoints', 'adQueue']);
      iframe.contentWindow?.postMessage({
        type: 'REMONE_AD_LIST',
        points: (state.currentPoints ?? 0).toFixed(6),
        ads: (state.adQueue ?? []).map((ad) => ({
          id: ad.id,
          title: `광고 ${ad.id.slice(0, 8)}`,
          reward: (((ad.cpm * ad.duration) / 60 / 1000) || 0).toFixed(4),
          duration: `${ad.duration}초`,
        })),
      }, '*');
    } catch (e) {
      console.error('[리모네] 사이드바 동기화 오류', e);
      clearInterval(syncTimer);
    }
  }, 1000);

  // iframe으로부터의 플레이어 오픈 요청을 수신해 background로 전달 (chrome API 접근 불가 대비)
  window.addEventListener('message', (event) => {
    if (event.source === iframe.contentWindow && event.data?.type === 'REMONE_OPEN_PLAYER' && event.data?.adId) {
      chrome.runtime.sendMessage({
        type: 'REMONE_OPEN_PLAYER',
        adId: event.data.adId,
      });
    }
  });
})();

// iframe 내부에서 메시지 수신해 카드 렌더링
window.addEventListener('message', (event) => {
  if (event.data?.type === 'REMONE_AD_LIST') {
    const listEl = document.getElementById('ad-list');
    const pointsEl = document.getElementById('points');
    if (!listEl || !pointsEl) return;
    pointsEl.textContent = `포인트: ${event.data.points ?? 0}`;
    listEl.innerHTML = '';
    event.data.ads?.forEach((ad) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <p class="title">${ad.title}</p>
        <p class="meta">리워드 ${ad.reward}P · 길이 ${ad.duration}</p>
      `;
      card.addEventListener('click', () => {
        window.parent.postMessage({ type: 'REMONE_OPEN_PLAYER', adId: ad.id }, '*');
      });
      listEl.appendChild(card);
    });
  }
});

// 사이드바 iframe이 아닌 페이지 상위에서만 주입되도록 보호
if (window.top !== window.self) {
  // iframe 내부라면 iframe 버전 코드가 실행되므로 주입 패스
}

// TODO: 향후 광고 큐 fetch 및 포인트 동기화 API 연동 예정

