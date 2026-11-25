// Dapur Kilat — tiny WebAudio bleeps. Created lazily on the first gesture;
// silent when the browser has no audio (headless screenshots included).

export function createAudio() {
  let ctx = null;

  function ac() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch {
      return null;
    }
    return ctx;
  }

  function tone(freq, dur, type = 'sine', vol = 0.12, when = 0) {
    const a = ac();
    if (!a) return;
    try {
      const t0 = a.currentTime + when;
      const osc = a.createOscillator();
      const gain = a.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(vol, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(gain);
      gain.connect(a.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch {
      // Headless or locked audio: stay silent, never break the game.
    }
  }

  return {
    unlock() {
      const a = ac();
      if (a && a.state === 'suspended') a.resume().catch(() => {});
    },
    take() { tone(520, 0.08, 'triangle', 0.1); },
    chop() { tone(180, 0.06, 'square', 0.08); tone(140, 0.05, 'square', 0.06, 0.05); },
    perfect() { tone(660, 0.09, 'sine', 0.12); tone(880, 0.12, 'sine', 0.12, 0.08); },
    put() { tone(340, 0.07, 'triangle', 0.1); },
    serve() { tone(740, 0.1, 'sine', 0.12); tone(988, 0.16, 'sine', 0.12, 0.09); },
    error() { tone(160, 0.14, 'sawtooth', 0.07); },
    clean() { tone(300, 0.08, 'triangle', 0.09); tone(420, 0.08, 'triangle', 0.09, 0.07); },
  };
}
