// 서비스 워커: 향후 광고 큐 fetch 및 기본 이벤트 훅
chrome.runtime.onInstalled.addListener(() => {
  console.log('리모네 확장 설치/업데이트 완료');
  initializeState();
  scheduleAlarm();
});

chrome.runtime.onStartup.addListener(() => {
  console.log('리모네 확장 시작');
  scheduleAlarm();
});

// 기본 상태 초기화
async function initializeState() {
  const initState = {
    adQueue: [],
    currentPoints: 0,
    lastActiveTime: Date.now(),
    isActive: true,
  };
  await chrome.storage.local.set(initState);
}

// 광고 큐 보충용 모의 데이터
const mockAds = [
  { id: 'ad001', duration: 15, cpm: 2.5 },
  { id: 'ad002', duration: 30, cpm: 3.0 },
  { id: 'ad003', duration: 20, cpm: 2.8 },
  { id: 'ad004', duration: 25, cpm: 3.2 },
  { id: 'ad005', duration: 18, cpm: 2.6 }
];

// 광고 큐 채우기
async function refillQueueIfNeeded() {
  const state = await chrome.storage.local.get(['adQueue']);
  const adQueue = state.adQueue ?? [];
  if (adQueue.length >= 5) return;
  const needed = 5 - adQueue.length;
  const newAds = [];
  for (let i = 0; i < needed; i += 1) {
    const ad = mockAds[Math.floor(Math.random() * mockAds.length)];
    // 고유 ID 확보를 위해 타임스탬프 접두
    newAds.push({ ...ad, id: `${ad.id}-${Date.now()}-${i}` });
  }
  await chrome.storage.local.set({ adQueue: [...adQueue, ...newAds] });
  console.log('[리모네] 광고 큐 보충 완료', newAds);
}

// 리워드 계산: 활동 시간(ms) * CPM / 60000
function calculateRewardMs(ms, cpm = 2) {
  const reward = (ms * cpm) / 60000;
  return Number(reward.toFixed(6));
}

// 알람 스케줄
function scheduleAlarm() {
  chrome.alarms.create('remone-queue-check', { periodInMinutes: 1 });
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'remone-queue-check') return;
  try {
    const state = await chrome.storage.local.get(['adQueue', 'isActive', 'lastActiveTime', 'currentPoints']);
    await refillQueueIfNeeded();
    if (!state.isActive) {
      console.log('[리모네] 비활성 상태, 광고 노출 스킵');
      return;
    }
    const now = Date.now();
    const elapsedMs = Math.max(0, now - (state.lastActiveTime ?? now));
    const earned = calculateRewardMs(elapsedMs, 2); // CPM $2 기준
    const nextPoints = (state.currentPoints ?? 0) + earned;
    await chrome.storage.local.set({ currentPoints: nextPoints, lastActiveTime: now });
    console.log(`[리모네] 활동 포인트 적립: +${earned.toFixed(6)} → 총 ${nextPoints.toFixed(6)}`);
  } catch (e) {
    console.error('[리모네] 알람 처리 중 오류', e);
  }
});

// 메시지 수신
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    if (message?.type === 'REMONE_OPEN_PLAYER' && message.adId) {
      const playerUrl = chrome.runtime.getURL(`player/player.html?adId=${message.adId}`);
      chrome.tabs.create({ url: playerUrl });
      sendResponse?.({ ok: true });
      return true;
    }
    if (message?.type === 'ACTIVITY_UPDATE') {
      const { isActive, duration } = message;
      const now = Date.now();
      // 포인트 적립은 알람에서만 처리하도록 상태만 저장
      chrome.storage.local.set({
        isActive,
        lastActiveTime: now,
      });
      console.log(`[리모네] 활동 상태 업데이트: isActive=${isActive}, duration=${duration}s`);
      sendResponse?.({ ok: true });
      return true;
    }
    if (message?.type === 'AD_COMPLETED' && message.adId) {
      chrome.storage.local.get(['adQueue', 'currentPoints']).then((state) => {
        const adQueue = state.adQueue ?? [];
        const completedAd = adQueue.find((ad) => ad.id === message.adId);
        const newQueue = adQueue.filter((ad) => ad.id !== message.adId);
        const bonus = completedAd ? ((completedAd.cpm * completedAd.duration) / 60 / 1000) : 0;
        const nextPoints = (state.currentPoints ?? 0) + bonus;
        chrome.storage.local.set({
          adQueue: newQueue,
          currentPoints: nextPoints,
        });
        console.log(`[리모네] 광고 시청 완료: ${message.adId}, 보너스 +${bonus.toFixed(6)}, 총 ${nextPoints.toFixed(6)}`);
      });
      sendResponse?.({ ok: true });
      return true;
    }
  } catch (e) {
    console.error('[리모네] 메시지 처리 오류', e);
  }
  return false;
});

