import { SOUND_EVENTS } from "./sound-events.js";

const SOUND_CONFIG = {
  [SOUND_EVENTS.SHOT]: [880, 0.07, "square", 0.04, 240],
  [SOUND_EVENTS.HIT]: [180, 0.05, "triangle", 0.05, 90],
  [SOUND_EVENTS.KILL]: [150, 0.16, "sawtooth", 0.08, 40],
  [SOUND_EVENTS.HURT]: [200, 0.25, "sawtooth", 0.18, 60],
  [SOUND_EVENTS.PICKUP]: [1200, 0.1, "sine", 0.08, 2000],
  [SOUND_EVENTS.LEVEL_UP]: [660, 0.25, "triangle", 0.12, 1046],
  [SOUND_EVENTS.EVOLUTION]: [392, 0.5, "triangle", 0.14, 1318],
  [SOUND_EVENTS.WARNING]: [330, 0.45, "square", 0.09, 660]
};

export function createAudioSystem({ volume = 0.5 } = {}) {
  let context = null;
  let master = null;
  return {
    unlock() {
      if (context) return;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      context = new AudioContext();
      master = context.createGain();
      master.gain.value = volume;
      master.connect(context.destination);
    },
    resume() { context?.resume(); },
    setVolume(value) { if (master) master.gain.value = value; },
    play(eventName) {
      if (!context || !master || !SOUND_CONFIG[eventName]) return;
      const [frequency, duration, type, gain, slide] = SOUND_CONFIG[eventName];
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, slide), now + duration);
      envelope.gain.setValueAtTime(gain, now);
      envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(envelope);
      envelope.connect(master);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.02);
    }
  };
}
