// 사용자 활동 감지 및 1분 단위 로그
(function setupActivityTracker() {
  let lastActive = Date.now();
  const updateActivity = () => { lastActive = Date.now(); };

  ['mousemove', 'keydown', 'scroll', 'click'].forEach((evt) => {
    window.addEventListener(evt, updateActivity, { passive: true });
  });

  // Idle API를 사용하여 비활동 상태 감지 (지원 안 되면 폴백)
  const logActivity = () => {
    const now = Date.now();
    const idleMs = now - lastActive;
    console.log(`[리모네] 활동 상태: ${idleMs < 60000 ? '활성' : '비활성'} / idle=${idleMs}ms`);
  };

  setInterval(logActivity, 60_000);
})();

// Idle API 사용 예시: 상태 변화 시 콘솔 로깅 (브라우저 지원 시)
chrome.idle?.onStateChanged?.addListener((newState) => {
  console.log('[리모네] Idle 상태 변경:', newState);
});

// TODO: 활동 상태를 background로 보내어 큐 생성/정지 제어 연동 예정

