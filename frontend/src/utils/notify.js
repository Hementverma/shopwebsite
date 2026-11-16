let audioCtx = null;
let ringTimer = null;
let activeNodes = [];

function ensureCtx() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

export function unlockAudio() {
  ensureCtx();
}

function playBurst() {
  const ctx = ensureCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const now = ctx.currentTime;
  const dur = 1.15;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.4, now + 0.06);
  gain.gain.setValueAtTime(0.4, now + dur - 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  gain.connect(ctx.destination);

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(750, now);
  osc.frequency.linearRampToValueAtTime(1300, now + dur / 2);
  osc.frequency.linearRampToValueAtTime(750, now + dur);
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + dur + 0.02);

  activeNodes.push(osc, gain);
  osc.onended = () => {
    activeNodes = activeNodes.filter(n => n !== osc && n !== gain);
    try { gain.disconnect(); } catch { /* ignore */ }
  };
}

export function playOrderSiren() {
  ensureCtx();
  stopOrderSiren();
  playBurst();
  ringTimer = setInterval(playBurst, 1100);
}

export function stopOrderSiren() {
  if (ringTimer) {
    clearInterval(ringTimer);
    ringTimer = null;
  }
  activeNodes.forEach(node => {
    try { if (node.stop) node.stop(); } catch { /* ignore */ }
    try { if (node.disconnect) node.disconnect(); } catch { /* ignore */ }
  });
  activeNodes = [];
}
