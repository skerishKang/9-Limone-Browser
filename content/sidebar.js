// 사이드바 iframe 주입 및 메시지 처리
(function injectSidebar() {
  if (window.__remoneInjected) return;
  window.__remoneInjected = true;

  // iframe 생성
  const iframe = document.createElement('iframe');
  iframe.id = 'remone-sidebar-frame';
  iframe.src = chrome.runtime.getURL('content/sidebar.html');
  document.documentElement.appendChild(iframe);

  // 가상 데이터 로딩: 추후 API 연동 예정
  const mockAds = [
    { id: 'ad-1', title: '브랜드 A 캠페인', reward: 10, duration: '15s' },
    { id: 'ad-2', title: '브랜드 B 캠페인', reward: 12, duration: '20s' }
  ];

  // iframe 로드 후 광고 리스트 전달
  iframe.addEventListener('load', () => {
    iframe.contentWindow.postMessage({ type: 'REMONE_AD_LIST', ads: mockAds, points: 0 }, '*');
  });

  // 카드 클릭 -> 플레이어 페이지 오픈
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'REMONE_OPEN_PLAYER' && event.data?.adId) {
      chrome.runtime.sendMessage({ type: 'REMONE_OPEN_PLAYER', adId: event.data.adId });
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

