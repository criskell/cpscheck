const durationButtons = document.querySelectorAll(".duration-btn");
const clickArea = document.getElementById("clickArea");
const clickAreaLabel = document.getElementById("clickAreaLabel");
const clicksEl = document.getElementById("clicks");
const timeEl = document.getElementById("time");
const cpsEl = document.getElementById("cps");
const bestEl = document.getElementById("best");
const bestValueEl = document.getElementById("bestValue");
const resetBtn = document.getElementById("resetBtn");

let duration = 5;
let clicks = 0;
let startTime = null;
let running = false;
let finished = false;
let rafId = null;

function bestKey() {
  return `cpscheck-best-${duration}`;
}

function loadBest() {
  const stored = localStorage.getItem(bestKey());
  if (stored) {
    bestEl.hidden = false;
    bestValueEl.textContent = Number(stored).toFixed(2);
  } else {
    bestEl.hidden = true;
  }
}

function saveBestIfHigher(cps) {
  const stored = Number(localStorage.getItem(bestKey()) || 0);
  if (cps > stored) {
    localStorage.setItem(bestKey(), cps.toFixed(2));
  }
  loadBest();
}

function setDuration(newDuration) {
  if (running) return;
  duration = newDuration;
  durationButtons.forEach((btn) => {
    btn.dataset.active = Number(btn.dataset.duration) === duration ? "true" : "false";
  });
  resetState();
}

function resetState() {
  clicks = 0;
  startTime = null;
  running = false;
  finished = false;
  cancelAnimationFrame(rafId);
  clickArea.dataset.done = "false";
  clickAreaLabel.textContent = "Clique para começar";
  clicksEl.textContent = "0";
  timeEl.textContent = duration.toFixed(1);
  cpsEl.textContent = "0.00";
  resetBtn.hidden = true;
  loadBest();
}

function tick() {
  const elapsed = (performance.now() - startTime) / 1000;
  const remaining = Math.max(duration - elapsed, 0);
  timeEl.textContent = remaining.toFixed(1);
  cpsEl.textContent = (clicks / Math.min(elapsed, duration)).toFixed(2);

  if (elapsed >= duration) {
    finishTest();
    return;
  }
  rafId = requestAnimationFrame(tick);
}

function finishTest() {
  running = false;
  finished = true;
  const finalCps = clicks / duration;
  timeEl.textContent = "0.0";
  cpsEl.textContent = finalCps.toFixed(2);
  clickArea.dataset.done = "true";
  clickAreaLabel.textContent = `${finalCps.toFixed(2)} CPS`;
  resetBtn.hidden = false;
  saveBestIfHigher(finalCps);
}

function handleClick() {
  if (finished) return;

  if (!running) {
    running = true;
    startTime = performance.now();
    clickAreaLabel.textContent = "";
    rafId = requestAnimationFrame(tick);
  }

  clicks += 1;
  clicksEl.textContent = String(clicks);
}

durationButtons.forEach((btn) => {
  btn.addEventListener("click", () => setDuration(Number(btn.dataset.duration)));
});

clickArea.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  handleClick();
});

clickArea.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

resetBtn.addEventListener("click", resetState);

resetState();
