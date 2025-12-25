// 포커스 기반 카운트다운 데모
let timer = 0;
let intervalId = null;

const statusEl = document.getElementById('status');

const startTimer = () => {
  if (intervalId) return;
  intervalId = setInterval(() => {
    timer += 1;
    statusEl.textContent = `포커스 ON - 시청 시간: ${timer}s`;
  }, 1000);
};

const stopTimer = () => {
  if (!intervalId) return;
  clearInterval(intervalId);
  intervalId = null;
  statusEl.textContent = `포커스 OFF - 누적 시청 시간: ${timer}s`;
};

window.addEventListener('focus', startTimer);
window.addEventListener('blur', stopTimer);

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    startTimer();
  } else {
    stopTimer();
  }
});

// 최초 포커스 상태 반영
if (document.hasFocus()) {
  startTimer();
} else {
  stopTimer();
}

// TODO: 광고 소스 로드, 세션/토큰 검증, 완료 이벤트 송신 추가 예정

