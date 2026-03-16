// Sound manager — loads and plays .ogg sounds from /sounds/
const sounds = {};
const BASE = '/sounds/';

const FILES = {
  move:    'tap-a.ogg',
  attack:  'switch-a.ogg',
  magic:   'switch-b.ogg',
  hit:     'tap-b.ogg',
  click:   'click-a.ogg',
  select:  'click-b.ogg',
  levelup: 'switch-b.ogg',
  buy:     'click-b.ogg',
  die:     'tap-b.ogg',
};

let muted = false;

function load(key) {
  if (sounds[key]) return;
  const audio = new Audio(BASE + FILES[key]);
  audio.preload = 'auto';
  sounds[key] = audio;
}

export function preloadSounds() {
  Object.keys(FILES).forEach(load);
}

export function play(key, volume = 0.4) {
  if (muted) return;
  load(key);
  const src = sounds[key];
  if (!src) return;
  try {
    const clone = src.cloneNode();
    clone.volume = volume;
    clone.play().catch(() => {});
  } catch (_) {}
}

export function setMuted(val) {
  muted = val;
}

export function getMuted() {
  return muted;
}
