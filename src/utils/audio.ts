/**
 * Web Audio API synthesized sound effects for course timer, transitions, and broadcasts.
 * Requires no external audio assets.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      try {
        audioCtx = new AudioCtxClass();
      } catch {
        // Fallback or unsupported
      }
    }
  }
  if (audioCtx) {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  }
  return audioCtx;
}

// Global listener to unlock audio context on any user interaction (click/touchstart/keydown)
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio, { once: true });
  window.addEventListener('touchstart', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });
}

/**
 * Play a broadcast notification chime
 */
export function playBroadcastSound(type: 'info' | 'warning' | 'emergency' | 'phase_change' | 'pause') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'emergency') {
      // Urgent double high beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.setValueAtTime(1108.73, now + 0.15); // C#6
      osc.frequency.setValueAtTime(880, now + 0.3);
      osc.frequency.setValueAtTime(1108.73, now + 0.45);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    } else if (type === 'phase_change' || type === 'pause') {
      // Harmonic 3-note chime (Major chord)
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.55);
      });
    } else if (type === 'warning') {
      // Two-tone warning
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(440.0, now + 0.18); // A4

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } else {
      // Info: gentle crystal ping
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(783.99, now); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.1); // C6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.42);
    }
  } catch {
    // Gracefully handle browser auto-play limitations
  }
}

export function playLongBeep() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now); // A5 (higher pitched)
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
    gain.gain.setValueAtTime(0.3, now + 2.7);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 3.0);
  } catch {
    // Gracefully handle browser auto-play limitations
  }
}

/**
 * Play an authentic air-raid siren sound effect (Sirena Antiaerea)
 */
export function playAirRaidSiren() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';

    // 3 wail cycles over 4.5 seconds
    const duration = 4.5;
    const lowFreq = 280;
    const highFreq = 880;

    osc.frequency.setValueAtTime(lowFreq, now);
    
    // Cycle 1
    osc.frequency.linearRampToValueAtTime(highFreq, now + 0.75);
    osc.frequency.linearRampToValueAtTime(lowFreq, now + 1.5);

    // Cycle 2
    osc.frequency.linearRampToValueAtTime(highFreq, now + 2.25);
    osc.frequency.linearRampToValueAtTime(lowFreq, now + 3.0);

    // Cycle 3
    osc.frequency.linearRampToValueAtTime(highFreq, now + 3.75);
    osc.frequency.linearRampToValueAtTime(lowFreq, now + duration);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.2);
    gain.gain.setValueAtTime(0.35, now + 4.0);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  } catch {
    // Gracefully handle browser auto-play limitations
  }
}
