const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');
const sandCanvas = document.getElementById('sand_canvas');
const ctx = canvasElement.getContext('2d');
const sandCtx = sandCanvas.getContext('2d');

let currentColor = 1; // index into COLORS in sand.js

// build clickable color swatches from sand.js's COLORS array
const pickerEl = document.getElementById('colorPicker');
COLORS.forEach((hex, i) => {
  if (i === 0) return; // skip index 0 (unused/empty)
  const swatch = document.createElement('div');
  swatch.className = 'swatch' + (i === currentColor ? ' selected' : '');
  swatch.style.background = hex;
  swatch.dataset.index = i;
  swatch.addEventListener('click', () => {
    currentColor = i;
    document.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected'));
    swatch.classList.add('selected');
  });
  pickerEl.appendChild(swatch);
});

document.addEventListener('keydown', (e) => {
  const n = parseInt(e.key);
  if (n >= 1 && n <= COLORS.length - 1) {
    currentColor = n;
    document.querySelectorAll('.swatch').forEach((s, idx) => {
      s.classList.toggle('selected', idx === n - 1);
    });
  }
});

document.getElementById('resetBtn').addEventListener('click', () => {
  resetGrid();
});

const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.6,
  minTrackingConfidence: 0.6
});

hands.onResults((results) => {
  ctx.save();
  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  ctx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      const dist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);

      const midX = (thumbTip.x + indexTip.x) / 2;
      const midY = (thumbTip.y + indexTip.y) / 2;
      // no manual flip here -- CSS scaleX(-1) on the container handles mirroring
      const px = midX * canvasElement.width;
      const py = midY * canvasElement.height;

      const isPinching = dist < 0.06;

      ctx.beginPath();
      ctx.arc(px, py, 12, 0, 2 * Math.PI);
      ctx.fillStyle = isPinching ? 'lime' : 'red';
      ctx.fill();

      if (isPinching) {
        spawnSand(px, py, currentColor);
      }
    }
  }
  ctx.restore();
});

const camera = new Camera(videoElement, {
  onFrame: async () => { await hands.send({ image: videoElement }); },
  width: 640,
  height: 480
});
camera.start();

function sandLoop() {
  stepSand();
  drawSand(sandCtx);
  requestAnimationFrame(sandLoop);
}
sandLoop();


