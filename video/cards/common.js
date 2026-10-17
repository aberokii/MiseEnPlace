// Deterministic playback for frame rendering. render.mjs calls window.seek(ms) before each screenshot.
// All motion in the cards is CSS @keyframes, so seeking = pausing every animation and setting its currentTime.
window.seek = function (ms) {
  document.getAnimations().forEach((a) => { a.pause(); a.currentTime = ms; });
};
window.cardReady = (async () => {
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  if (window.loadDemo) await window.loadDemo();
  return true;
})();
window.loadDemo = async function () {
  if (window.DEMO) return window.DEMO;
  const r = await fetch('../data/demo.json');
  window.DEMO = await r.json();
  if (window.build) window.build(window.DEMO);
  return window.DEMO;
};
