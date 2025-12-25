// iframe 내부에서 광고 리스트 렌더링 및 플레이어 오픈 메시지 전송
(function () {
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
          // 기본 경로: 부모로 postMessage
          window.parent.postMessage({
            type: 'REMONE_OPEN_PLAYER',
            adId: ad.id,
          }, '*');

          // 백업 경로: chrome API 직접 호출 가능 시
          try {
            chrome.runtime?.sendMessage({
              type: 'REMONE_OPEN_PLAYER',
              adId: ad.id,
            });
          } catch (e) {
            // 무시
          }
        });

        listEl.appendChild(card);
      });
    }
  });
})();
