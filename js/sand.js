const GRID_W = 160, GRID_H = 120; // scaled down from 640x480 for perf
const grid = new Uint8Array(GRID_W * GRID_H); // 0 = empty, else = color index

const COLORS = [
  '',        // 0 = unused/empty
  '#ff6fa8', // hot pink
  '#ffb3c6', // pastel pink
  '#b28dff', // lavender
  '#8ecae6', // sky blue
  '#a0e7a0', // mint green
  '#fff275', // pastel yellow
  '#ffb570', // peach
  '#e0c068', // sand tan
];

function spawnSand(px, py, colorIndex, radius = 2) {
  const gx = Math.floor(px / (640 / GRID_W));
  const gy = Math.floor(py / (480 / GRID_H));
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const x = gx + dx, y = gy + dy;
      if (x < 0 || x >= GRID_W || y < 0 || y >= GRID_H) continue;
      if (Math.random() < 0.5) continue;
      grid[y * GRID_W + x] = colorIndex;
    }
  }
}

function resetGrid() {
  grid.fill(0);
}

function stepSand() {
  for (let y = GRID_H - 2; y >= 0; y--) {
    const leftToRight = Math.random() < 0.5;
    for (let i = 0; i < GRID_W; i++) {
      const x = leftToRight ? i : GRID_W - 1 - i;
      const idx = y * GRID_W + x;
      const cell = grid[idx];
      if (cell === 0) continue;

      const belowIdx = (y + 1) * GRID_W + x;
      if (grid[belowIdx] === 0) {
        grid[belowIdx] = cell;
        grid[idx] = 0;
        continue;
      }

      const canLeft = x > 0 && grid[(y + 1) * GRID_W + (x - 1)] === 0;
      const canRight = x < GRID_W - 1 && grid[(y + 1) * GRID_W + (x + 1)] === 0;

      if (canLeft && canRight) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        const target = (y + 1) * GRID_W + (x + dir);
        grid[target] = cell;
        grid[idx] = 0;
      } else if (canLeft) {
        grid[(y + 1) * GRID_W + (x - 1)] = cell;
        grid[idx] = 0;
      } else if (canRight) {
        grid[(y + 1) * GRID_W + (x + 1)] = cell;
        grid[idx] = 0;
      }
    }
  }
}

function drawSand(ctx) {
  const cellW = 640 / GRID_W, cellH = 480 / GRID_H;
  ctx.clearRect(0, 0, 640, 480);
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const cell = grid[y * GRID_W + x];
      if (cell === 0) continue;
      ctx.fillStyle = COLORS[cell];
      ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
    }
  }
}