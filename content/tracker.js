// 사용자 활동 감지 및 1분 단위 상태 보고
(function setupActivityTracker() {
  let lastActive = Date.now();
  let isActive = true;
  let activeAccumSec = 0;

  const updateActivity = () => {
    lastActive = Date.now();
    isActive = true;
  };

  ['mousemove', 'keydown', 'scroll', 'click'].forEach((evt) => {
    window.addEventListener(evt, updateActivity, { passive: true });
  });

  // 1초 간격으로 활동/비활동 판정
  setInterval(() => {
    const idleMs = Date.now() - lastActive;
    const nowActive = idleMs < 10_000;
    if (nowActive) activeAccumSec += 1;
    if (isActive !== nowActive) {
      console.log(`[리모네] 활동 상태 변경: ${nowActive ? '활성' : '비활성'} (idle=${idleMs}ms)`);
      isActive = nowActive;
    }
  }, 1000);

  // 1분마다 background에 상태 전송
  setInterval(() => {
    chrome.runtime.sendMessage({
      type: 'ACTIVITY_UPDATE',
      isActive,
      duration: activeAccumSec,
    }).catch(() => {});
    activeAccumSec = 0;
  }, 60_000);
})();

// Idle API 사용 예시: 상태 변화 시 콘솔 로깅 (브라우저 지원 시)
chrome.idle?.onStateChanged?.addListener((newState) => {
  console.log('[리모네] Idle 상태 변경:', newState);
});

