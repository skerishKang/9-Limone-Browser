// 광고 시청 포커스/완료 처리
const urlParams = new URLSearchParams(window.location.search);
const adId = urlParams.get('adId');
const video = document.getElementById('ad-video');
const statusEl = document.getElementById('status');

let focusTime = 0;
let intervalId = null;
let isFocused = document.hasFocus();

const startTimer = () => {
  if (intervalId) return;
  intervalId = setInterval(() => {
    if (isFocused && !video.paused) {
      focusTime += 1;
      statusEl.textContent = `시청 시간: ${focusTime}초 (포커스 유지 중)`;
    }
  }, 1000);
};

const stopTimer = () => {
  if (!intervalId) return;
  clearInterval(intervalId);
  intervalId = null;
  statusEl.textContent = `포커스 OFF - 누적 시청 시간: ${focusTime}초`;
};

window.addEventListener('focus', () => { isFocused = true; startTimer(); });
window.addEventListener('blur', () => { isFocused = false; });

document.addEventListener('visibilitychange', () => {
  isFocused = document.visibilityState === 'visible';
});

if (!adId) {
  statusEl.textContent = '광고 ID가 없습니다.';
} else {
  statusEl.textContent = `광고 ${adId.slice(0, 10)} 시청 중...`;
  startTimer();

  video.addEventListener('ended', () => {
    statusEl.textContent = '광고 시청 완료! 포인트가 적립되었습니다.';
    chrome.runtime.sendMessage({
      type: 'AD_COMPLETED',
      adId
    }, (response) => {
      console.log('[플레이어] 광고 완료 처리:', response);
      setTimeout(() => window.close(), 3000);
    });
  });
}

